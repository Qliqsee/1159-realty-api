import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { UpdateRequirementDto } from './dto/update-requirement.dto';
import { RejectDocumentDto } from './dto/reject-document.dto';
import { FileUploadService } from '../file-upload/file-upload.service';
import { formatFullName } from '../common/utils/name.utils';

@Injectable()
export class RequirementsService {
  constructor(
    private prisma: PrismaService,
    private fileUploadService: FileUploadService,
  ) {}

  async create(caseId: string, createRequirementDto: CreateRequirementDto) {
    const caseItem = await this.prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseItem) {
      throw new NotFoundException(`Case with ID ${caseId} not found`);
    }

    const requirement = await this.prisma.caseRequirement.create({
      data: {
        caseId,
        title: createRequirementDto.title,
        description: createRequirementDto.description,
      },
    });

    return requirement;
  }

  async findAll(caseId: string) {
    const caseItem = await this.prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseItem) {
      throw new NotFoundException(`Case with ID ${caseId} not found`);
    }

    const requirements = await this.prisma.caseRequirement.findMany({
      where: { caseId },
      include: {
        sampleDocuments: true,
        submittedDocuments: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return requirements;
  }

  async findOne(id: string) {
    const requirement = await this.prisma.caseRequirement.findUnique({
      where: { id },
      include: {
        case: true,
        sampleDocuments: true,
        submittedDocuments: {
          include: {
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                otherName: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!requirement) {
      throw new NotFoundException(`Requirement with ID ${id} not found`);
    }

    return requirement;
  }

  async update(id: string, updateRequirementDto: UpdateRequirementDto) {
    await this.findOne(id);

    const updatedRequirement = await this.prisma.caseRequirement.update({
      where: { id },
      data: updateRequirementDto,
    });

    return updatedRequirement;
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.caseRequirement.delete({
      where: { id },
    });

    return { message: 'Requirement deleted successfully' };
  }

  async uploadSample(requirementId: string, file: Express.Multer.File) {
    const requirement = await this.findOne(requirementId);

    const { url } = await this.fileUploadService.uploadDocument(
      file,
      'sample-documents',
    );

    const sampleDocument = await this.prisma.sampleDocument.create({
      data: {
        requirementId,
        fileUrl: url,
        fileName: file.originalname,
        fileType: file.mimetype,
      },
    });

    return sampleDocument;
  }

  async deleteSample(sampleId: string) {
    const sample = await this.prisma.sampleDocument.findUnique({
      where: { id: sampleId },
    });

    if (!sample) {
      throw new NotFoundException(`Sample document with ID ${sampleId} not found`);
    }

    await this.prisma.sampleDocument.delete({
      where: { id: sampleId },
    });

    return { message: 'Sample document deleted successfully' };
  }

  async uploadDocument(
    requirementId: string,
    clientId: string,
    file: Express.Multer.File,
  ) {
    const requirement = await this.findOne(requirementId);

    const { url } = await this.fileUploadService.uploadDocument(
      file,
      'requirement-documents',
    );

    const document = await this.prisma.requirementDocument.create({
      data: {
        requirementId,
        clientId,
        fileUrl: url,
        fileName: file.originalname,
        fileType: file.mimetype,
      },
    });

    return document;
  }

  async getMyDocuments(requirementId: string, clientId: string) {
    const requirement = await this.findOne(requirementId);

    const documents = await this.prisma.requirementDocument.findMany({
      where: {
        requirementId,
        clientId,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return documents;
  }

  async approveDocument(documentId: string, reviewerId: string) {
    const document = await this.prisma.requirementDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    const updatedDocument = await this.prisma.requirementDocument.update({
      where: { id: documentId },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedBy: reviewerId,
        rejectionReason: null,
      },
    });

    return updatedDocument;
  }

  async rejectDocument(
    documentId: string,
    rejectDocumentDto: RejectDocumentDto,
    reviewerId: string,
  ) {
    const document = await this.prisma.requirementDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    const updatedDocument = await this.prisma.requirementDocument.update({
      where: { id: documentId },
      data: {
        status: 'REJECTED',
        rejectionReason: rejectDocumentDto.reason,
        reviewedAt: new Date(),
        reviewedBy: reviewerId,
      },
    });

    return updatedDocument;
  }

  async getDocumentStats(requirementId: string) {
    await this.findOne(requirementId);

    const [totalCompleted, totalPending, totalRejected] = await Promise.all([
      this.prisma.requirementDocument.count({
        where: { requirementId, status: 'APPROVED' },
      }),
      this.prisma.requirementDocument.count({
        where: { requirementId, status: 'PENDING' },
      }),
      this.prisma.requirementDocument.count({
        where: { requirementId, status: 'REJECTED' },
      }),
    ]);

    return {
      totalCompleted,
      totalPending,
      totalRejected,
    };
  }

  async getMyRequirements(caseId: string, clientId: string) {
    const caseItem = await this.prisma.case.findFirst({
      where: {
        id: caseId,
        clientId,
      },
    });

    if (!caseItem) {
      throw new NotFoundException(`Case with ID ${caseId} not found`);
    }

    const requirements = await this.prisma.caseRequirement.findMany({
      where: { caseId },
      include: {
        sampleDocuments: true,
        submittedDocuments: {
          where: { clientId },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return requirements;
  }
}
