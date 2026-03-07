/**
 * 상태 카테고리 API 스키마 전체 파일
 */
import { z } from 'zod';

/** 제품분류 등록 입력 폼의 스키마 */
export const useCreateEvidenceMemoSchema = z.object({
  project_id: z.string({ message: '프로젝트 ID를 입력해주세요.' }),
  evidence_id: z.string({ message: '증거 ID를 입력해주세요.' }),
  content: z.string({ message: '내용을 입력해주세요.' }),
});

export const useCreateEvidenceBookmarkSchema = z.object({
  project_id: z.string({ message: '프로젝트 ID를 입력해주세요.' }),
  evidence_id: z.string({ message: '증거 ID를 입력해주세요.' }),
});
export const useCreateEvidencePinSchema = z.object({
  project_id: z.string({ message: '프로젝트 ID를 입력해주세요.' }),
  evidence_id: z.string({ message: '증거 ID를 입력해주세요.' }),
});
export const useModifyEvidenceBookmarkSchema = z.object({
  memo_id: z.string({ message: '메모 ID를 입력해주세요' }),
  content: z.string({ message: '내용을 입력해주세요.' }),
});

export const useDeleteEvidenceMemoSchema = z.object({
  memo_id: z.string({ message: '메모 ID를 입력해주세요' }),
});

export const useModifyAdminEvidenceSchema = z.object({
  office_id: z.string({ message: 'office_id를 입력해주세요' }),
  project_id: z.string({ message: 'project_id 입력해주세요.' }),
  evidence_id: z.string({ message: 'evidence_id 입력해주세요.' }),
  evidence_title: z.string().optional(),
  evidence_number: z.union([z.string(), z.number()]).optional(),
  start_page: z.union([z.string(), z.number()]).optional(),
  end_page: z.union([z.string(), z.number()]).optional(),
  page_count: z.union([z.string(), z.number()]).optional(),
  name: z.string().optional(),
  reference: z.string().optional(),
  category: z.string().optional(),
});

export const useModifyAdminMatchingSchema = z.object({
  office_id: z.string({ message: 'office_id를 입력해주세요' }),
  project_id: z.string({ message: 'project_id 입력해주세요.' }),
  matching_id: z.string({ message: 'matching_id 입력해주세요.' }),
  pdf_page: z.union([z.string(), z.number()]).default(''),
  pdf_name: z.string().default(''),
  sequence_number: z.string().default(''),
  evidence_page: z.string().default(''),
  evidence_number: z.union([z.string(), z.number()]).default(''),
});

export const useResignSelfSchema = z.object({
  project_id: z.string({ message: 'project_id 입력해주세요.' }),
});

export const useResignSuperUserSchema = z.object({
  project_id: z.string({ message: 'project_id 입력해주세요.' }),
  receiver_id: z.string({ message: 'user_id 입력해주세요.' }),
});

export const useResignSchema = z.object({
  project_id: z.string({ message: 'project_id 입력해주세요.' }),
  user_id: z.string({ message: 'user_id 입력해주세요.' }),
});
