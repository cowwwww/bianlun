import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
  Button,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  Stack,
  Switch,
  FormControlLabel,
  type ChipProps,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Payment as PaymentIcon,
  Phone as PhoneIcon,
  Upload as UploadIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { listAllRegistrations, updateRegistrationStatus, type Registration } from '../services/registrationService';

interface RegistrationForm {
  id: string;
  tournamentId: string;
  title: string;
  fields: FormField[];
  isActive: boolean;
  createdAt: Date;
}

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'select' | 'textarea' | 'file' | 'checkbox' | 'date';
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: string;
}

const RegistrationManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  const [currentForm, setCurrentForm] = useState<RegistrationForm>({
    id: '',
    tournamentId: 'current-tournament',
    title: '参赛报名表',
    fields: [],
    isActive: true,
    createdAt: new Date(),
  });

  const [newField, setNewField] = useState<FormField>({
    id: '',
    type: 'text',
    label: '',
    required: false,
    placeholder: '',
  });

  useEffect(() => {
    loadRegistrations();
    loadRegistrationForms();
  }, []);

  const filterRegistrations = useCallback(() => {
    let filtered = registrations;

    if (searchQuery) {
      const keyword = searchQuery.toLowerCase();
      filtered = filtered.filter((reg) => {
        const haystack = [
          reg.teamName,
          reg.participants?.join(' '),
          reg.wechatId,
          reg.contact,
          reg.category,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(keyword);
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((reg) => (reg.status || 'pending') === statusFilter);
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter((reg) => (reg.paymentStatus || 'pending') === paymentFilter);
    }

    setFilteredRegistrations(filtered);
  }, [registrations, searchQuery, statusFilter, paymentFilter]);

  useEffect(() => {
    filterRegistrations();
  }, [filterRegistrations]);

  const loadRegistrations = async () => {
    try {
      const data = await listAllRegistrations();
      setRegistrations(data);
    } catch (error) {
      console.error('Error loading registrations:', error);
    }
  };

  const loadRegistrationForms = async () => {
    try {
      // 默认报名表模板
      const defaultForm: RegistrationForm = {
        id: 'default',
        tournamentId: 'current-tournament',
        title: '羽毛球比赛报名表',
        isActive: true,
        createdAt: new Date(),
        fields: [
          { id: '1', type: 'text', label: '姓名', required: true, placeholder: '请输入您的真实姓名' },
          { id: '2', type: 'email', label: '邮箱', required: true, placeholder: 'example@email.com' },
          { id: '3', type: 'phone', label: '手机号', required: true, placeholder: '+86 138-0000-0000' },
          { id: '4', type: 'text', label: '微信号', required: true, placeholder: '请输入您的微信号' },
          { id: '5', type: 'number', label: '年龄', required: true, placeholder: '请输入年龄' },
          { id: '6', type: 'select', label: '性别', required: true, options: ['男', '女'] },
          { id: '7', type: 'text', label: '学校/单位', required: false, placeholder: '请输入所在学校或单位' },
          { id: '8', type: 'select', label: '参赛组别', required: true, options: ['男子单打', '女子单打', '男子双打', '女子双打', '混合双打'] },
          { id: '9', type: 'textarea', label: '比赛经验', required: false, placeholder: '请简要描述您的比赛经验' },
          { id: '10', type: 'text', label: '紧急联系人', required: true, placeholder: '紧急情况联系人姓名' },
          { id: '11', type: 'phone', label: '紧急联系电话', required: true, placeholder: '紧急联系人电话' },
          { id: '12', type: 'file', label: '身份证明', required: false, placeholder: '上传身份证或学生证照片' },
          { id: '13', type: 'checkbox', label: '同意参赛条款', required: true },
        ],
      };
      setCurrentForm(defaultForm);
    } catch (error) {
      console.error('Error loading registration forms:', error);
    }
  };

  const handleApproveRegistration = async (id: string) => {
    try {
      await updateRegistrationStatus(id, 'approved');
      setRegistrations((prev) => prev.map((reg) => (reg.id === id ? { ...reg, status: 'approved' as const } : reg)));
    } catch (error) {
      console.error('Error approving registration:', error);
    }
  };

  const handleRejectRegistration = async (id: string) => {
    try {
      await updateRegistrationStatus(id, 'rejected');
      setRegistrations((prev) => prev.map((reg) => (reg.id === id ? { ...reg, status: 'rejected' as const } : reg)));
    } catch (error) {
      console.error('Error rejecting registration:', error);
    }
  };

  const addFormField = () => {
    if (newField.label) {
      const field: FormField = {
        ...newField,
        id: Date.now().toString(),
      };
      
      setCurrentForm(prev => ({
        ...prev,
        fields: [...prev.fields, field],
      }));
      
      setNewField({
        id: '',
        type: 'text',
        label: '',
        required: false,
        placeholder: '',
      });
    }
  };

  const removeFormField = (fieldId: string) => {
    setCurrentForm(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId),
    }));
  };

  const saveRegistrationForm = async () => {
    // 表单构建暂时保留本地状态，不落库
    // No-op placeholder
  };

  const getStatusColor = (status: string): ChipProps['color'] => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'paid':
        return 'success';
      case 'refunded':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return '已通过';
      case 'pending': return '待审核';
      case 'rejected': return '已拒绝';
      case 'paid': return '已支付';
      case 'refunded': return '已退款';
      default: return status;
    }
  };

  const exportRegistrations = () => {
    const csvContent = [
      ['队伍', '成员', '组别', '状态', '支付', '报名时间'].join(','),
      ...filteredRegistrations.map(reg => [
        reg.teamName || reg.participants?.[0] || '',
        reg.participants?.join('|') || '',
        reg.category || '',
        getStatusText(reg.status || 'pending'),
        getStatusText(reg.paymentStatus || 'pending'),
        new Date(reg.createdAt || reg.updatedAt || '').toLocaleDateString(),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `registrations_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
          📝 报名管理中心
        </Typography>
        <Typography variant="h6" color="text.secondary">
          管理参赛者报名、审核、支付状态
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            title: '总报名数',
            value: registrations.length,
            icon: <PersonAddIcon />,
            color: '#667eea',
          },
          {
            title: '待审核',
            value: registrations.filter((r) => (r.status || 'pending') === 'pending').length,
            icon: <CheckIcon />,
            color: '#f093fb',
          },
          {
            title: '已通过',
            value: registrations.filter((r) => r.status === 'approved').length,
            icon: <CheckIcon />,
            color: '#55efc4',
          },
          {
            title: '支付完成',
            value: registrations.filter((r) => r.paymentStatus === 'paid').length,
            icon: <PaymentIcon />,
            color: '#ffeaa7',
          },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: stat.color, width: 56, height: 56 }}>
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 3, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="报名列表" />
          <Tab label="报名表设计" />
          <Tab label="数据分析" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          {/* Filters and Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="搜索参赛者..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
              />
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>审核状态</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="审核状态"
                >
                  <MenuItem value="all">全部</MenuItem>
                  <MenuItem value="pending">待审核</MenuItem>
                  <MenuItem value="approved">已通过</MenuItem>
                  <MenuItem value="rejected">已拒绝</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>支付状态</InputLabel>
                <Select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  label="支付状态"
                >
                  <MenuItem value="all">全部</MenuItem>
                  <MenuItem value="pending">待支付</MenuItem>
                  <MenuItem value="paid">已支付</MenuItem>
                  <MenuItem value="refunded">已退款</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={exportRegistrations}
              >
                导出数据
              </Button>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => alert('手动添加报名暂未开放，请直接在 PocketBase 后台创建记录')}
              >
                手动添加
              </Button>
            </Box>
          </Box>

          {/* Registrations Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>参赛者</TableCell>
                  <TableCell>联系方式</TableCell>
                  <TableCell>基本信息</TableCell>
                  <TableCell>参赛组别</TableCell>
                  <TableCell>审核状态</TableCell>
                  <TableCell>支付状态</TableCell>
                  <TableCell>报名时间</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRegistrations.map((registration) => {
                  const displayName = registration.teamName || registration.participants?.[0] || '未命名队伍';
                  const displayMembers = registration.participants?.join('，') || '未填写成员';
                  const status = registration.status || 'pending';
                  const paymentStatus = registration.paymentStatus || 'pending';
                  const created = registration.createdAt || registration.updatedAt || '';

                  return (
                    <TableRow key={registration.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {displayName[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {displayName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {registration.category || '未分组'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">{displayMembers}</Typography>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="body2">{registration.contact || '无'}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MessageIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="body2">{registration.wechatId || '无'}</Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={registration.category || '未指定'}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={getStatusText(status)}
                          color={getStatusColor(status)}
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={getStatusText(paymentStatus)}
                          color={getStatusColor(paymentStatus)}
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {created ? new Date(created).toLocaleDateString() : '--'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedRegistration(registration);
                              setViewDialogOpen(true);
                            }}
                          >
                            <ViewIcon />
                          </IconButton>
                          
                          {status === 'pending' && (
                            <>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleApproveRegistration(registration.id)}
                              >
                                <CheckIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRejectRegistration(registration.id)}
                              >
                                <CloseIcon />
                              </IconButton>
                            </>
                          )}
                          
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              📋 报名表设计器
            </Typography>
            <Button
              variant="contained"
              onClick={saveRegistrationForm}
              disabled={currentForm.fields.length === 0}
            >
              保存表单
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  表单预览
                </Typography>
                
                <TextField
                  fullWidth
                  label="表单标题"
                  value={currentForm.title}
                  onChange={(e) => setCurrentForm({ ...currentForm, title: e.target.value })}
                  sx={{ mb: 3 }}
                />

                <Stack spacing={2}>
                  {currentForm.fields.map((field, index) => (
                    <Box key={field.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2">
                          {index + 1}. {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
                        </Typography>
                        <IconButton size="small" onClick={() => removeFormField(field.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      
                      {field.type === 'text' && (
                        <TextField
                          fullWidth
                          placeholder={field.placeholder}
                          disabled
                          size="small"
                        />
                      )}
                      
                      {field.type === 'email' && (
                        <TextField
                          fullWidth
                          type="email"
                          placeholder={field.placeholder}
                          disabled
                          size="small"
                        />
                      )}
                      
                      {field.type === 'select' && (
                        <FormControl fullWidth size="small" disabled>
                          <Select value="">
                            {field.options?.map((option, optIndex) => (
                              <MenuItem key={optIndex} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                      
                      {field.type === 'textarea' && (
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          placeholder={field.placeholder}
                          disabled
                          size="small"
                        />
                      )}
                      
                      {field.type === 'file' && (
                        <Button
                          variant="outlined"
                          startIcon={<UploadIcon />}
                          disabled
                        >
                          选择文件
                        </Button>
                      )}
                      
                      {field.type === 'checkbox' && (
                        <FormControlLabel
                          control={<Switch disabled />}
                          label={field.label}
                        />
                      )}
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  添加表单字段
                </Typography>

                <Stack spacing={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>字段类型</InputLabel>
                    <Select
                      value={newField.type}
                      onChange={(e) => setNewField({ ...newField, type: e.target.value as FormField['type'] })}
                      label="字段类型"
                    >
                      <MenuItem value="text">文本</MenuItem>
                      <MenuItem value="email">邮箱</MenuItem>
                      <MenuItem value="phone">电话</MenuItem>
                      <MenuItem value="number">数字</MenuItem>
                      <MenuItem value="select">选择框</MenuItem>
                      <MenuItem value="textarea">多行文本</MenuItem>
                      <MenuItem value="file">文件上传</MenuItem>
                      <MenuItem value="checkbox">复选框</MenuItem>
                      <MenuItem value="date">日期</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    size="small"
                    label="字段标签"
                    value={newField.label}
                    onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                  />

                  <TextField
                    fullWidth
                    size="small"
                    label="占位符文本"
                    value={newField.placeholder}
                    onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                  />

                  {newField.type === 'select' && (
                    <TextField
                      fullWidth
                      size="small"
                      label="选项 (用逗号分隔)"
                      placeholder="选项1,选项2,选项3"
                      onChange={(e) => setNewField({ 
                        ...newField, 
                        options: e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt)
                      })}
                    />
                  )}

                  <FormControlLabel
                    control={
                      <Switch
                        checked={newField.required}
                        onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                      />
                    }
                    label="必填字段"
                  />

                  <Button
                    variant="contained"
                    onClick={addFormField}
                    disabled={!newField.label}
                    fullWidth
                  >
                    添加字段
                  </Button>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
            📊 报名数据分析
          </Typography>
          <Alert severity="info">
            数据分析功能开发中...
          </Alert>
        </Paper>
      )}

      {/* View Registration Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          参赛者详细信息
        </DialogTitle>
        <DialogContent>
          {selectedRegistration && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">队伍/成员</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedRegistration.teamName || selectedRegistration.participants?.join('，') || '未填写'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">邮箱</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedRegistration.email || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">电话</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedRegistration.contact || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">微信号</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedRegistration.wechatId || '—'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">比赛经验</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedRegistration.experience || '—'}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>关闭</Button>
          {selectedRegistration?.status === 'pending' && (
            <>
              <Button
                color="success"
                variant="contained"
                onClick={() => {
                  handleApproveRegistration(selectedRegistration.id);
                  setViewDialogOpen(false);
                }}
              >
                通过审核
              </Button>
              <Button
                color="error"
                variant="outlined"
                onClick={() => {
                  handleRejectRegistration(selectedRegistration.id);
                  setViewDialogOpen(false);
                }}
              >
                拒绝申请
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RegistrationManagement; 