import pb from './pocketbase';

export type FormFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'select'
  | 'textarea'
  | 'file'
  | 'checkbox'
  | 'date'
  | 'team_members'
  | 'judge_selection';

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  validation?: string;
  options?: string[];
  minLength?: number;
  maxLength?: number;
  accept?: string; // For file uploads
  minTeamMembers?: number;
  maxTeamMembers?: number;
  allowJudgeSelection?: boolean;
  order: number;
}

export interface TeamMemberRole {
  id: string;
  label: string;
  required: boolean;
  maxCount?: number;
}

export interface FormConfig {
  id: string;
  tournamentId: string;
  title: string;
  description?: string;
  fields: FormField[];
  teamMemberRoles: TeamMemberRole[];
  minTeamMembers: number;
  maxTeamMembers: number;
  allowJudgeSelection: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const defaultFormConfig: FormConfig = {
  id: 'default',
  tournamentId: 'default',
  title: 'ADA线上辩论全国赛 - 2026 报名表',
  description: '请按照指定格式填写团队信息和成员信息',
  fields: [
    {
      id: 'team_name',
      type: 'text',
      label: '队伍名称',
      required: true,
      placeholder: '请输入队伍名称（如：橙子酱队）',
      minLength: 2,
      maxLength: 50,
      order: 1,
    },
    {
      id: 'category',
      type: 'select',
      label: '参赛组别',
      required: true,
      options: ['公开组', '高校组', '中学组'],
      order: 2,
    },
    {
      id: 'team_members',
      type: 'team_members',
      label: '队员信息（按格式填写）',
      required: true,
      helpText: '格式：姓名,学校,年级,联系方式,经验描述（如有）。例如：张三,清华大学,2023级,13800138000,辩论经验丰富',
      minTeamMembers: 4,
      maxTeamMembers: 12,
      order: 3,
    },
    {
      id: 'judge_selection',
      type: 'judge_selection',
      label: '随队评委（可选）',
      required: false,
      helpText: '如果队伍中有成员担任评委，请提供其详细信息和比赛经验',
      allowJudgeSelection: true,
      order: 4,
    },
    {
      id: 'contact_name',
      type: 'text',
      label: '领队姓名',
      required: true,
      placeholder: '队伍负责人姓名',
      order: 5,
    },
    {
      id: 'contact_phone',
      type: 'phone',
      label: '领队联系电话',
      required: true,
      placeholder: '13800138000',
      order: 6,
    },
    {
      id: 'contact_wechat',
      type: 'text',
      label: '领队微信号',
      required: true,
      placeholder: '微信号',
      order: 7,
    },
    {
      id: 'school',
      type: 'text',
      label: '主要学校',
      required: true,
      placeholder: '队伍主要成员所在学校',
      order: 8,
    },
    {
      id: 'experience',
      type: 'textarea',
      label: '队伍参赛经验',
      required: false,
      placeholder: '请简要描述团队的参赛经验和成绩',
      maxLength: 1000,
      order: 9,
    },
    {
      id: 'documents',
      type: 'file',
      label: '证件照片',
      required: false,
      accept: '.jpg,.jpeg,.png',
      helpText: '请上传学生证或身份证照片',
      order: 10,
    },
    {
      id: 'resumes',
      type: 'file',
      label: '随评履历证明',
      required: false,
      accept: '.jpg,.jpeg,.png,.pdf',
      helpText: '如果有随评，请上传其履历和评赛经验证明',
      order: 11,
    },
    {
      id: 'additional_notes',
      type: 'textarea',
      label: '备注',
      required: false,
      placeholder: '其他需要说明的信息',
      maxLength: 500,
      order: 12,
    },
  ],
  teamMemberRoles: [
    {
      id: 'leader',
      label: '领队',
      required: true,
      maxCount: 1,
    },
    {
      id: 'accompanying_judge',
      label: '随评',
      required: false,
      maxCount: 2,
    },
    {
      id: 'member',
      label: '队员',
      required: true,
      maxCount: 10,
    },
  ],
  minTeamMembers: 4,
  maxTeamMembers: 12,
  allowJudgeSelection: true,
  isActive: true,
  createdAt: '2025-12-01',
  updatedAt: '2025-12-01',
};

const mapRecord = (record: any): FormConfig => ({
  id: record.id || 'default',
  tournamentId: record.tournamentId || 'default',
  title: record.title || '团队报名表',
  description: record.description || '',
  fields: record.fields || defaultFormConfig.fields,
  teamMemberRoles: record.teamMemberRoles || defaultFormConfig.teamMemberRoles,
  minTeamMembers: record.minTeamMembers ?? 4,
  maxTeamMembers: record.maxTeamMembers ?? 12,
  allowJudgeSelection: record.allowJudgeSelection ?? true,
  isActive: record.isActive ?? true,
  createdAt: record.created || '',
  updatedAt: record.updated || '',
});

export const getFormConfig = async (tournamentId: string): Promise<FormConfig> => {
  if (tournamentId === 'default') return defaultFormConfig;

  try {
    const records = await pb.collection('form_configs').getFullList({
      filter: `tournamentId="${tournamentId}"`,
    });

    if (records.length > 0) {
      return mapRecord(records[0]);
    }

    // Return default config without creating - will be created when explicitly saved
    return { ...defaultFormConfig, tournamentId };
  } catch (error) {
    console.error('Error getting form config:', error);
    return { ...defaultFormConfig, tournamentId };
  }
};

export const createFormConfig = async (
  config: Omit<FormConfig, 'id' | 'createdAt' | 'updatedAt'>
): Promise<FormConfig> => {
  try {
    const record = await pb.collection('form_configs').create(config);
    return mapRecord(record);
  } catch (error) {
    console.error('Error creating form config:', error);
    throw new Error('Failed to create form configuration');
  }
};

export const updateFormConfig = async (id: string, config: Partial<FormConfig>): Promise<void> => {
  try {
    if (id === 'default') {
      // For default config, just return success since it's static
      return;
    }

    // Try to update first
    try {
      await pb.collection('form_configs').update(id, config);
    } catch (updateError) {
      // If update fails, try to create the record
      const { id: _, createdAt, updatedAt, ...createData } = config as any;
      await pb.collection('form_configs').create({ ...createData, tournamentId: id });
    }
  } catch (error) {
    console.error('Error updating form config:', error);
    throw new Error('Failed to update form configuration');
  }
};

export const getDefaultFormConfig = (): FormConfig => defaultFormConfig;

export const validateFormField = (field: FormField, value: any): string | null => {
  if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
    return `${field.label}不能为空`;
  }

  if (value && field.minLength && value.length < field.minLength) {
    return `${field.label}长度不能少于${field.minLength}个字符`;
  }

  if (value && field.maxLength && value.length > field.maxLength) {
    return `${field.label}长度不能超过${field.maxLength}个字符`;
  }

  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return '邮箱格式不正确';
    }
  }

  if (field.type === 'phone' && value) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(value)) {
      return '手机号格式不正确';
    }
  }

  if (field.type === 'team_members' && value) {
    const members = Array.isArray(value) ? value : [];
    if (field.minTeamMembers && members.length < field.minTeamMembers) {
      return `队伍成员不能少于${field.minTeamMembers}人`;
    }
    if (field.maxTeamMembers && members.length > field.maxTeamMembers) {
      return `队伍成员不能超过${field.maxTeamMembers}人`;
    }
  }

  return null;
};

export const validateTeamComposition = (
  members: Array<{ name: string; role: string }>,
  roles: TeamMemberRole[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const roleCounts: Record<string, number> = {};

  // Count members by role
  members.forEach((member) => {
    roleCounts[member.role] = (roleCounts[member.role] || 0) + 1;
  });

  // Validate required roles and counts
  roles.forEach((role) => {
    const count = roleCounts[role.id] || 0;

    if (role.required && count === 0) {
      errors.push(`必须至少有1名${role.label}`);
    }

    if (role.maxCount && count > role.maxCount) {
      errors.push(`${role.label}不能超过${role.maxCount}人`);
    }
  });

  return { isValid: errors.length === 0, errors };
};
