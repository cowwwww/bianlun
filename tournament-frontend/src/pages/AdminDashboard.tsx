import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getTournaments, type Tournament } from '../services/tournamentService';
import { listAllRegistrations, listRegistrationsByTournament, updateRegistrationPayment, updateRegistrationStatus, updateRegistration, deleteRegistration, type Registration } from '../services/registrationService';
import { listJudges, updateJudgeTypes, createJudge, type Judge, type JudgeType } from '../services/judgeService';
import { getFormConfig, updateFormConfig, type FormConfig } from '../services/formConfigService';
import { getCircuit, publishCircuit, type Circuit } from '../services/circuitService';
import { getTeamMembers, updateTeamMember, createTeamMember, type TeamMember } from '../services/teamMemberService';

// Helper function to map RecordModel to TeamMember
const mapRecordToTeamMember = (record: Record<string, unknown>): TeamMember => ({
  id: record.id as string,
  registrationId: record.registrationId as string,
  tournamentId: record.tournamentId as string,
  name: record.name as string,
  role: record.role as TeamMember['role'],
  school: record.school as string | undefined,
  year: record.year as string | undefined,
  contact: record.contact as string | undefined,
  experience: record.experience as string | undefined,
  isCompeting: (record.isCompeting as boolean) || false,
  createdAt: (record.created as string) || '',
  updatedAt: (record.updated as string) || '',
});
import pb from '../services/pocketbase';

type TabKey = 'overview' | 'teams' | 'tournament' | 'forms' | 'judges' | 'circuit' | 'scoring';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [tournamentId, setTournamentId] = useState('');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [allRegistrations, setAllRegistrations] = useState<Registration[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [circuit, setCircuit] = useState<Circuit | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Registration | null>(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedJudge, setSelectedJudge] = useState<Judge | null>(null);
  const [teamDetailDialog, setTeamDetailDialog] = useState(false);
  const [experienceDialog, setExperienceDialog] = useState(false);
  const [addMemberDialog, setAddMemberDialog] = useState(false);
  const [judgeDialog, setJudgeDialog] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    role: 'member' as TeamMember['role'],
    school: '',
    year: '',
    contact: '',
    experience: ''
  });
  const [editingTeam, setEditingTeam] = useState(false);
  const [regSearch, setRegSearch] = useState('');
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingTournaments, setLoadingTournaments] = useState(false);
  const [loadingJudges, setLoadingJudges] = useState(false);
  const [savingJudgeId, setSavingJudgeId] = useState<string | null>(null);
  const [formConfigDialog, setFormConfigDialog] = useState(false);

  useEffect(() => {
    const loadTournaments = async () => {
      try {
        const data = await getTournaments();
        setTournaments(data);
        if (!tournamentId && data.length > 0) {
          setTournamentId(data[0].id);
        }
      } finally {
        setLoadingTournaments(false);
      }
    };

    loadTournaments();
    loadAllRegistrations();
    loadJudgesData();
  }, []);

  useEffect(() => {
    if (tournamentId) {
      loadTeamRegistrations(tournamentId);
      loadFormConfig(tournamentId);
      loadCircuit(tournamentId);
    } else {
      // Auto-select the ADA tournament if available, otherwise the first available tournament
      const adaTournament = tournaments.find(t => t.id === '9jv180qufoqwmqa');
      if (adaTournament) {
        setTournamentId(adaTournament.id);
      } else if (tournaments.length > 0) {
        setTournamentId(tournaments[0].id);
      }
    }
  }, [tournamentId, tournaments]);


  const loadAllRegistrations = async () => {
    try {
      const data = await listAllRegistrations();
      setAllRegistrations(data);
    } catch (error) {
      console.error('加载报名汇总失败', error);
    }
  };

  const loadTeamRegistrations = async (tid: string) => {
    try {
      setLoadingTeams(true);
      const data = await listRegistrationsByTournament(tid);
      setRegistrations(data);
    } catch (error) {
      console.error('加载队伍失败', error);
    } finally {
      setLoadingTeams(false);
    }
  };

  const loadJudgesData = async () => {
    try {
      setLoadingJudges(true);
      const data = await listJudges();
      setJudges(data);
    } catch (error) {
      console.error('加载评委失败', error);
    } finally {
      setLoadingJudges(false);
    }
  };

  const loadFormConfig = async (tid: string) => {
    try {
      const config = await getFormConfig(tid);
      setFormConfig(config);
    } catch (error) {
      console.error('加载表单配置失败', error);
    }
  };

  const loadCircuit = async (tid: string) => {
    try {
      const circuitData = await getCircuit(tid);
      setCircuit(circuitData);
    } catch (error) {
      console.error('加载对阵图失败', error);
    }
  };


  const handleViewTeamDetails = async (registration: Registration) => {
    setSelectedTeam(registration);
    try {
      const members = await getTeamMembers(registration.id);
      setSelectedTeamMembers(members);
      setTeamDetailDialog(true);
    } catch (error) {
      console.error('加载队伍详情失败', error);
    }
  };

  const handleUpdateTeamMember = async (memberId: string, updates: Partial<TeamMember>) => {
    try {
      await updateTeamMember(memberId, updates);
      setSelectedTeamMembers(prev =>
        prev.map(member =>
          member.id === memberId ? { ...member, ...updates } : member
        )
      );

      // If role changed to accompanying_judge, sync to judges
      if (updates.role === 'accompanying_judge') {
        console.log('Syncing accompanying judge:', memberId);
        // Use setTimeout to ensure state is updated first
        setTimeout(() => syncAccompanyingJudgeToJudges(memberId, selectedTeam), 100);
      }
    } catch (error) {
      console.error('更新队员信息失败', error);
      alert('更新失败，请稍后重试');
    }
  };

  const syncAccompanyingJudgeToJudges = async (memberId: string, team?: Registration) => {
    try {
      console.log('Starting sync for member:', memberId);

      // Fetch member data directly from database to ensure we have latest data
      const memberResponse = await pb.collection('team_members').getOne(memberId);
      const member = mapRecordToTeamMember(memberResponse);

      console.log('Fetched member:', member);
      if (!member || !team) {
        console.log('Member or team not found');
        return;
      }

      // Check if this judge already exists
      const existingJudges = await listJudges();
      console.log('Existing judges:', existingJudges.map(j => j.fullName));
      const existingJudge = existingJudges.find(j =>
        j.fullName === member.name
      );

      console.log('Existing judge found:', existingJudge?.fullName);

      if (!existingJudge) {
        // Create new judge record
        const judgeData = {
          fullName: member.name,
          experience: member.experience || '',
          phone: member.contact || '',
          wechatId: member.contact || '',
          judgeTypes: ['随队评委'] as JudgeType[],
          status: 'approved' as const,
          obligationsLeft: 3, // Default obligations
          totalObligations: 3,
          teamId: team.id,
          teamName: team.teamName
        };

        console.log('Creating judge:', judgeData);
        await createJudge(judgeData);
        console.log('Synced accompanying judge to judges collection:', member.name);
      } else {
        console.log('Judge already exists, skipping creation');
      }
    } catch (error) {
      console.error('同步随评到评委管理失败:', error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedTeam) return;

    try {
      const memberData = {
        registrationId: selectedTeam.id,
        tournamentId: selectedTeam.tournamentId,
        name: newMember.name,
        role: newMember.role,
        school: newMember.school,
        year: newMember.year,
        contact: newMember.contact,
        experience: newMember.experience
      };

      const createdMember = await createTeamMember(memberData);

      setSelectedTeamMembers(prev => [...prev, createdMember]);

      // If adding an accompanying judge, sync to judges
      if (newMember.role === 'accompanying_judge') {
        await syncAccompanyingJudgeToJudges(createdMember.id, selectedTeam);
      }

      // Reset form
      setNewMember({
        name: '',
        role: 'member',
        school: '',
        year: '',
        contact: '',
        experience: ''
      });

      setAddMemberDialog(false);
    } catch (error) {
      console.error('添加队员失败', error);
      alert('添加失败，请稍后重试');
    }
  };

  const handleUpdatePaymentStatus = async (registrationId: string, paymentStatus: Registration['paymentStatus']) => {
    try {
      console.log('Updating payment status for registration:', registrationId, 'to:', paymentStatus);
      await updateRegistrationPayment(registrationId, paymentStatus);
      setRegistrations(prev =>
        prev.map(reg =>
          reg.id === registrationId ? { ...reg, paymentStatus } : reg
        )
      );
      setAllRegistrations(prev =>
        prev.map(reg =>
          reg.id === registrationId ? { ...reg, paymentStatus } : reg
        )
      );
    } catch (error) {
      console.error('更新支付状态失败', error);
      alert(`更新失败: ${error.message || '请稍后重试'}`);
    }
  };

  const handleUpdateRegistrationStatus = async (registrationId: string, status: Registration['status']) => {
    try {
      await updateRegistrationStatus(registrationId, status);
      setRegistrations(prev =>
        prev.map(reg =>
          reg.id === registrationId ? { ...reg, status } : reg
        )
      );
      setAllRegistrations(prev =>
        prev.map(reg =>
          reg.id === registrationId ? { ...reg, status } : reg
        )
      );
    } catch (error) {
      console.error('更新审核状态失败', error);
      alert(`更新失败: ${error.message || '请稍后重试'}`);
    }
  };

  const handleUpdateTeamInfo = async (registrationId: string, updates: Partial<Pick<Registration, 'teamName' | 'category' | 'contact' | 'wechatId' | 'notes' | 'needsAccompanyingJudge'>>) => {
    try {
      await updateRegistration(registrationId, updates);
      setRegistrations(prev =>
        prev.map(reg =>
          reg.id === registrationId ? { ...reg, ...updates } : reg
        )
      );
      setAllRegistrations(prev =>
        prev.map(reg =>
          reg.id === registrationId ? { ...reg, ...updates } : reg
        )
      );
      if (selectedTeam?.id === registrationId) {
        setSelectedTeam(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error('更新队伍信息失败', error);
      alert(`更新失败: ${error.message || '请稍后重试'}`);
    }
  };

  const handleDeleteTeam = async (registrationId: string) => {
    if (!window.confirm('确认删除这个队伍吗？此操作无法撤销。')) {
      return;
    }

    try {
      await deleteRegistration(registrationId);
      setRegistrations(prev => prev.filter(reg => reg.id !== registrationId));
      setAllRegistrations(prev => prev.filter(reg => reg.id !== registrationId));
      setTeamDetailDialog(false);
      setSelectedTeam(null);
      setSelectedTeamMembers([]);
    } catch (error) {
      console.error('删除队伍失败', error);
      alert(`删除失败: ${error.message || '请稍后重试'}`);
    }
  };

  const filteredRegistrations = useMemo(() => {
    const keyword = regSearch.trim().toLowerCase();
    if (!keyword) return registrations;
    return registrations.filter((r) => {
      const haystack = [
        r.teamName,
        r.category,
        r.participants?.join(' '),
        r.contact,
        r.wechatId,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }, [regSearch, registrations]);

  const teamStats = useMemo(() => {
    const total = registrations.length;
    const approved = registrations.filter((r) => r.status === 'approved').length;
    const pending = registrations.filter((r) => r.status === 'pending').length;
    return { total, approved, pending };
  }, [registrations]);

  const crmStats = useMemo(() => {
    const total = allRegistrations.length;
    const paid = allRegistrations.filter((r) => r.paymentStatus === 'paid').length;
    const pending = allRegistrations.filter((r) => r.status === 'pending').length;
    return { total, paid, pending };
  }, [allRegistrations]);

  const judgeGroups = useMemo(() => {
    const team = judges.filter((j) => j.judgeTypes?.includes('随队评委'));
    const external = judges.filter((j) => j.judgeTypes?.includes('外聘评委'));
    const unclassified = judges.filter(
      (j) => !j.judgeTypes?.includes('随队评委') && !j.judgeTypes?.includes('外聘评委')
    );
    return { team, external, unclassified };
  }, [judges]);

  const handleUpdateJudgeType = async (judgeId: string, judgeTypes: JudgeType[]) => {
    try {
      setSavingJudgeId(judgeId);
      await updateJudgeTypes(judgeId, judgeTypes);
      setJudges((prev) => prev.map((j) => (j.id === judgeId ? { ...j, judgeTypes } : j)));
    } catch (error) {
      console.error('更新评委类型失败', error);
      alert('更新评委类型失败，请稍后重试');
    } finally {
      setSavingJudgeId(null);
    }
  };

  const handleUpdateJudge = async (judgeId: string, updates: Partial<Pick<Judge, 'fullName' | 'experience' | 'comments' | 'phone' | 'wechatId' | 'judgeTypes' | 'obligationsLeft' | 'totalObligations' | 'teamId' | 'teamName'>>) => {
    try {
      await pb.collection('judges').update(judgeId, updates);
      setJudges((prev) => prev.map((j) => (j.id === judgeId ? { ...j, ...updates } : j)));
    } catch (error) {
      console.error('更新评委信息失败', error);
      alert('更新评委信息失败，请稍后重试');
    }
  };

  const handleDeleteJudge = async (judgeId: string) => {
    if (!window.confirm('确认删除这个评委吗？此操作无法撤销。')) {
      return;
    }

    try {
      await pb.collection('judges').delete(judgeId);
      setJudges((prev) => prev.filter((j) => j.id !== judgeId));
    } catch (error) {
      console.error('删除评委失败', error);
      alert('删除评委失败，请稍后重试');
    }
  };

  const handleUpdateFormConfig = async (tournamentId: string, config: FormConfig) => {
    if (!tournamentId) return;

    try {
      await updateFormConfig(tournamentId, config);
      setFormConfig(config);
      setFormConfigDialog(false);
    } catch (error) {
      console.error('更新表单配置失败', error);
      alert('更新表单配置失败，请稍后重试');
    }
  };

  const handlePublishCircuit = async () => {
    if (!circuit) return;

    try {
      await publishCircuit(circuit.id);
      setCircuit(prev => prev ? { ...prev, status: 'published' } : null);
    } catch (error) {
      console.error('发布对阵图失败', error);
      alert('发布对阵图失败，请稍后重试');
    }
  };


  const quickLinks = [
    {
      title: '赛事管理',
      desc: '创建/查看赛事，配置评分维度与队伍规模',
      action: () => navigate('/tournament-organizer'),
      tag: '赛事',
    },
    {
      title: '报名 CRM',
      desc: '查看报名队伍，审核/导出报名信息',
      action: () => navigate('/registration-management'),
      tag: '报名',
    },
    {
      title: '比赛对阵',
      desc: '安排比赛对阵，分配评委，管理赛程',
      action: () => navigate(`/tournaments/${tournamentId}/manage-matches`),
      tag: '对阵',
      disabled: !tournamentId,
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
        管理后台
      </Typography>
          <Chip label="队伍/报名/评委一站式" color="primary" size="small" />
        </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          主办方常用入口：赛事、报名 CRM、对阵、评委。先选择赛事即可统一管理队伍/队员、报名信息和裁判分组。
      </Typography>

        {/* Quick Links */}
        <Grid container spacing={2}>
        {quickLinks.map((item) => (
          <Grid item xs={12} md={4} key={item.title}>
              <Card sx={{ height: '100%', borderRadius: 2, border: '1px solid #e0e0e0', cursor: 'pointer' }}
                    onClick={item.disabled ? undefined : item.action}>
              <CardContent>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <Chip label={item.tag} size="small" color="primary" />
                </Stack>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {item.desc}
                </Typography>
                  <Button
                    variant="contained"
                    onClick={(e) => { e.stopPropagation(); item.action(); }}
                    disabled={item.disabled}
                    fullWidth
                  >
                  进入
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      </Box>

      <Paper sx={{ borderRadius: 2, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab value="overview" label="总览" />
          <Tab value="teams" label="队伍管理" />
          <Tab value="forms" label="报名表单配置" />
          <Tab value="judges" label="评委管理" />
          <Tab value="circuit" label="比赛对阵" />
          <Tab value="scoring" label="评分管理" />
        </Tabs>
      </Paper>

      {activeTab === 'overview' && (
        <Stack spacing={3}>
          {/* Key Metrics */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                数据概览
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{tournaments.length}</Typography>
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>赛事数量</Typography>
                      <Typography variant="body2" color="text.secondary">
                        活跃赛事
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{allRegistrations.filter(r => r.status === 'approved').length}</Typography>
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>已确认队伍</Typography>
                      <Typography variant="body2" color="text.secondary">
                        通过审核
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{allRegistrations.filter(r => r.paymentStatus === 'paid').length}</Typography>
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>已缴费</Typography>
                      <Typography variant="body2" color="text.secondary">
                        完成支付
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{judges.filter(j => j.judgeTypes?.includes('随队评委')).length}</Typography>
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>随队评委</Typography>
                      <Typography variant="body2" color="text.secondary">
                        义务评委
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>


          {/* Current Tournament Status */}
          {tournamentId && (
            <Card sx={{ borderRadius: 2 }}>
        <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  当前赛事状态
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {registrations.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        参赛队伍
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {judges.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        评委人数
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Box sx={{ mb: 1 }}>
                        <Chip
                          size="small"
                          label={circuit?.status === 'published' ? '已发布' : circuit ? '草稿中' : '未创建'}
                          color={circuit?.status === 'published' ? 'success' : 'warning'}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        对阵状态
          </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}

      {activeTab === 'teams' && (
        <Stack spacing={3}>
          {/* Tournament Selection & Stats */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                队伍管理
          </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>选择赛事</InputLabel>
              <Select
              value={tournamentId}
              onChange={(e) => setTournamentId(e.target.value)}
                label="选择赛事"
              >
                {tournaments.map((tournament) => (
                  <MenuItem key={tournament.id} value={tournament.id}>
                    {tournament.title || tournament.name || tournament.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
                  onClick={() => tournamentId && loadTeamRegistrations(tournamentId)}
                  disabled={!tournamentId}
                  size="small"
                >
                  载入队伍
                </Button>
                <Button
                  variant="outlined"
                  disabled={!tournamentId}
                  onClick={() => navigate(`/tournaments/${tournamentId}/manage-matches`)}
                  size="small"
                >
                  对阵管理
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Chip label={`队伍数：${teamStats.total}`} size="small" />
                <Chip label={`已通过：${teamStats.approved}`} size="small" color="success" />
                <Chip label={`待审核：${teamStats.pending}`} size="small" color="warning" />
              </Stack>
            </CardContent>
          </Card>

          {/* Team List */}
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }} alignItems="center">
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    报名队伍列表
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    用于确认组别、队伍成员，便于对阵与裁判分配。
                  </Typography>
                </Box>
                <TextField
                  label="搜索队伍/队员/联系方式"
                  value={regSearch}
                  onChange={(e) => setRegSearch(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ maxWidth: 300 }}
                />
              </Stack>

            {loadingTeams ? (
              <Typography color="text.secondary">加载中...</Typography>
            ) : filteredRegistrations.length === 0 ? (
              <Typography color="text.secondary">暂无报名或未匹配搜索。</Typography>
            ) : (
              <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>队伍 / 组别</TableCell>
                  <TableCell>成员</TableCell>
                  <TableCell>联系方式</TableCell>
                  <TableCell>审核状态</TableCell>
                  <TableCell>支付状态</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
                <TableBody>
                  {filteredRegistrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {reg.teamName?.[0] || '队'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">{reg.teamName || '未命名队伍'}</Typography>
                            {reg.category && (
                              <Typography variant="caption" color="text.secondary">
                                {reg.category}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {reg.participants?.join('，') || '未填写'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">微信：{reg.wechatId || '无'}</Typography>
                        <Typography variant="body2">电话：{reg.contact || '无'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value={reg.status || 'pending'}
                          onChange={(e) => handleUpdateRegistrationStatus(reg.id, e.target.value as Registration['status'])}
                          sx={{ minWidth: 100 }}
                        >
                          <MenuItem value="pending">待审核</MenuItem>
                          <MenuItem value="approved">已通过</MenuItem>
                          <MenuItem value="rejected">已拒绝</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value={reg.paymentStatus || 'pending'}
                          onChange={(e) => handleUpdatePaymentStatus(reg.id, e.target.value as Registration['paymentStatus'])}
                          sx={{ minWidth: 100 }}
                        >
                          <MenuItem value="pending">待支付</MenuItem>
                          <MenuItem value="paid">已支付</MenuItem>
                          <MenuItem value="refunded">已退款</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewTeamDetails(reg)}
                          >
                            查看详情
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDeleteTeam(reg.id)}
                          >
                            删除
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          </Card>
        </Stack>
      )}

      {activeTab === 'forms' && (
        <Stack spacing={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6">报名表单配置</Typography>
                  <Typography variant="body2" color="text.secondary">
                    自定义团队报名时需要收集的信息字段
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setFormConfigDialog(true)}
                  disabled={!tournamentId}
                >
                  配置表单
                </Button>
              </Stack>

              {!tournamentId && (
                <Alert severity="info">
                  请先选择赛事以配置报名表单
                </Alert>
              )}

              {tournamentId && formConfig && (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle1">表单基本信息</Typography>
                    <Typography>表单标题：{formConfig.title}</Typography>
                    <Typography>队伍规模：{formConfig.minTeamMembers}-{formConfig.maxTeamMembers}人</Typography>
                    <Typography>允许随评：{formConfig.allowJudgeSelection ? '是' : '否'}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle1">表单字段</Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>字段名称</TableCell>
                          <TableCell>类型</TableCell>
                          <TableCell>必填</TableCell>
                          <TableCell>说明</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formConfig.fields.map((field) => (
                          <TableRow key={field.id}>
                            <TableCell>{field.label}</TableCell>
                            <TableCell>{field.type}</TableCell>
                            <TableCell>{field.required ? '是' : '否'}</TableCell>
                            <TableCell>{field.helpText || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>

                  <Box>
                    <Typography variant="subtitle1">队员角色配置</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {formConfig.teamMemberRoles.map((role) => (
                        <Chip
                          key={role.id}
                          label={`${role.label} (${role.required ? '必选' : '可选'}${role.maxCount ? `, 最多${role.maxCount}人` : ''})`}
                          size="small"
                        />
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Stack>
      )}

      {activeTab === 'circuit' && (
        <Stack spacing={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6">比赛对阵</Typography>
                  <Typography variant="body2" color="text.secondary">
                    查看比赛对阵，分配评委和赛程
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  {circuit && circuit.status === 'draft' && (
                    <Button
                      variant="contained"
                      startIcon={<CheckIcon />}
                      onClick={handlePublishCircuit}
                    >
                      发布对阵
                    </Button>
                  )}
                </Stack>
              </Stack>

              {!tournamentId && (
                <Alert severity="info">
                  请先选择赛事
                </Alert>
              )}

              {tournamentId && registrations.length === 0 && (
                <Alert severity="warning">
                  当前赛事暂无参赛队伍，请先确认报名队伍
                </Alert>
              )}

              {circuit && (
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip label={`总轮数：${circuit.rounds.length}`} />
                    <Chip label={`状态：${circuit.status === 'published' ? '已发布' : '草稿'}`} color={circuit.status === 'published' ? 'success' : 'warning'} />
                    <Chip label={`当前轮次：${circuit.currentRound}`} />
                  </Box>

                  {circuit.rounds.map((round) => (
                    <Card key={round.id} variant="outlined">
                      <CardContent>
                        <Typography variant="h6">{round.roundName}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {round.scheduledAt ? `时间：${new Date(round.scheduledAt).toLocaleString()}` : '时间未定'}
                        </Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>比赛</TableCell>
                              <TableCell>正方</TableCell>
                              <TableCell>反方</TableCell>
                              <TableCell>评委</TableCell>
                              <TableCell>房间</TableCell>
                              <TableCell>结果</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {round.matches.map((match) => (
                              <TableRow key={match.id}>
                                <TableCell>{match.id.split('-').pop()}</TableCell>
                                <TableCell>{match.sideAName || match.sideAId}</TableCell>
                                <TableCell>{match.sideBName || match.sideBId}</TableCell>
                                <TableCell>{match.judgeNames?.join(', ') || match.judgeIds.length}人</TableCell>
                                <TableCell>{match.room || '-'}</TableCell>
                                <TableCell>
                                  {match.result ? (
                                    <Chip
                                      size="small"
                                      label={match.result.winner === 'A' ? '正方胜' : match.result.winner === 'B' ? '反方胜' : '平局'}
                                      color="success"
                                    />
                                  ) : (
                                    <Chip size="small" label="未完成" variant="outlined" />
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Stack>
      )}

      {activeTab === 'scoring' && (
        <Stack spacing={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>评分管理</Typography>
              <Typography variant="body2" color="text.secondary">
                查看评委评分情况，管理评分任务分配
              </Typography>

              {circuit ? (
                <Table size="small" sx={{ mt: 2 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>比赛</TableCell>
                      <TableCell>评委</TableCell>
                      <TableCell>评分状态</TableCell>
                      <TableCell>提交时间</TableCell>
                      <TableCell>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {circuit.rounds.flatMap(round =>
                      round.matches.flatMap(match =>
                        match.judgeIds.map(judgeId => {
                          const judge = judges.find(j => j.id === judgeId);
                          return (
                            <TableRow key={`${match.id}-${judgeId}`}>
                              <TableCell>{match.id.split('-').pop()}</TableCell>
                              <TableCell>{judge?.fullName || judgeId}</TableCell>
                              <TableCell>
                                <Chip size="small" label="待评分" variant="outlined" />
                              </TableCell>
                              <TableCell>-</TableCell>
                              <TableCell>
                                <Button size="small" variant="outlined">
                                  查看评分
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )
                    )}
                  </TableBody>
                </Table>
              ) : (
                <Alert severity="info">
                  请先生成比赛对阵图
                </Alert>
              )}
            </CardContent>
          </Card>
        </Stack>
      )}

      {activeTab === 'tournament' && (
        <Stack spacing={3}>
          <Grid container spacing={2}>
            {loadingTournaments ? (
              <Grid item xs={12}>
                <Typography color="text.secondary">加载赛事中...</Typography>
              </Grid>
            ) : tournaments.map((t) => (
              <Grid item xs={12} md={4} key={t.id}>
                <Card sx={{ borderRadius: 2, border: '1px solid #e0e0e0', height: '100%' }}>
                  <CardContent>
                    <Chip label={t.type || '赛事'} size="small" sx={{ mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {t.title || t.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {t.description || '暂无描述'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      时间：{t.startDate} - {t.endDate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      地点：{t.location}
                    </Typography>
                    {t.playersPerTeam ? (
                      <Typography variant="body2" color="text.secondary">
                        队伍人数：{t.playersPerTeam}
                      </Typography>
                    ) : null}
                    {t.totalTeams ? (
                      <Typography variant="body2" color="text.secondary">
                        规模：{t.totalTeams} 支队伍
                      </Typography>
                    ) : null}
                    {t.scoringConfig?.length ? (
                      <Typography variant="body2" color="text.secondary">
                        评分维度：{t.scoringConfig.map((d) => d.label).join(' / ')}
                      </Typography>
                    ) : null}
                    <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
                      <Button size="small" variant="outlined" onClick={() => navigate(`/tournaments/${t.id}`)}>
                        查看详情
                      </Button>
                      <Button size="small" variant="contained" onClick={() => navigate('/tournament-organizer')}>
                        配置赛事
            </Button>
          </Stack>
        </CardContent>
      </Card>
              </Grid>
            ))}
          </Grid>

          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  报名 CRM 总览
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  汇总报名状态，便于营销跟进与付款核验。
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Chip label={`报名总数：${crmStats.total}`} />
                <Chip label={`已支付：${crmStats.paid}`} color="success" />
                <Chip label={`待审核：${crmStats.pending}`} color="warning" />
              </Stack>
              <Button variant="contained" onClick={() => navigate('/registration-management')}>
                打开报名管理
              </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              在报名管理中可导出 CSV、手动添加报名、设计表单字段。
            </Typography>
          </Paper>
        </Stack>
      )}

      {activeTab === 'judges' && (
        <Stack spacing={3}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  评委分组管理
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  可标记随队评委 / 外聘评委，辅助排签和支付结算。
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Chip label={`随队评委：${judgeGroups.team.length}`} />
                <Chip label={`外聘评委：${judgeGroups.external.length}`} color="primary" />
                <Chip label={`未分类：${judgeGroups.unclassified.length}`} color="warning" />
              </Stack>
            </Stack>

            {loadingJudges ? (
              <Typography color="text.secondary">加载评委列表中...</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>评委</TableCell>
                    <TableCell>经验 / 备注</TableCell>
                    <TableCell>联系方式</TableCell>
                    <TableCell>所属队伍</TableCell>
                    <TableCell>剩余义务</TableCell>
                    <TableCell>类型标记</TableCell>
                    <TableCell align="right">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {judges.map((judge) => (
                    <TableRow key={judge.id}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar>{judge.fullName?.[0] || '评'}</Avatar>
                          <Typography variant="subtitle2">{judge.fullName}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          maxWidth: 200
                        }}>
                          {judge.experience || '未填写经验'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 200
                        }}>
                          {judge.comments || '无备注'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">微信：{judge.wechatId || '无'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {judge.teamName || '无'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {judge.obligationsLeft !== undefined ? judge.obligationsLeft : '未设置'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          fullWidth
                          value={judge.judgeTypes?.[0] || ''}
                          onChange={(e) => {
                            const nextType = e.target.value ? [e.target.value as JudgeType] : [];
                            setJudges((prev) =>
                              prev.map((j) => (j.id === judge.id ? { ...j, judgeTypes: nextType } : j))
                            );
                          }}
                        >
                          <MenuItem value="">未分类</MenuItem>
                          <MenuItem value="随队评委">随队评委</MenuItem>
                          <MenuItem value="外聘评委">外聘评委</MenuItem>
                          <MenuItem value="教学导师">教学导师</MenuItem>
                          <MenuItem value="技术裁判">技术裁判</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setSelectedJudge(judge);
                              setJudgeDialog(true);
                            }}
                          >
                            编辑
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDeleteJudge(judge.id)}
                          >
                            删除
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            disabled={savingJudgeId === judge.id}
                            onClick={() => handleUpdateJudgeType(judge.id, judge.judgeTypes || [])}
                          >
                            {savingJudgeId === judge.id ? '保存中...' : '保存'}
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Stack>
      )}

      {/* Form Configuration Dialog */}
      <Dialog open={formConfigDialog} onClose={() => setFormConfigDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>报名表单配置</DialogTitle>
        <DialogContent>
          {formConfig && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              {formConfig && (
                <>
                  <TextField
                    label="表单标题"
                    value={formConfig.title}
                    onChange={(e) => setFormConfig({ ...formConfig, title: e.target.value })}
                    fullWidth
                  />

                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="最小队伍人数"
                      type="number"
                      value={formConfig.minTeamMembers}
                      onChange={(e) => setFormConfig({ ...formConfig, minTeamMembers: Number(e.target.value) })}
                    />
                    <TextField
                      label="最大队伍人数"
                      type="number"
                      value={formConfig.maxTeamMembers}
                      onChange={(e) => setFormConfig({ ...formConfig, maxTeamMembers: Number(e.target.value) })}
                    />
                  </Stack>

                  <FormControl fullWidth>
                    <InputLabel>允许随评选择</InputLabel>
                    <Select
                      value={formConfig.allowJudgeSelection}
                      onChange={(e) => setFormConfig({ ...formConfig, allowJudgeSelection: e.target.value === 'true' })}
                      label="允许随评选择"
                    >
                      <MenuItem value="true">是</MenuItem>
                      <MenuItem value="false">否</MenuItem>
                    </Select>
                  </FormControl>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormConfigDialog(false)}>取消</Button>
          <Button onClick={() => formConfig && handleUpdateFormConfig(tournamentId, formConfig)} variant="contained">
            保存配置
          </Button>
        </DialogActions>
      </Dialog>

      {/* Team Detail Dialog */}
      <Dialog
        open={teamDetailDialog}
        onClose={() => setTeamDetailDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          队伍详情 - {selectedTeam?.teamName}
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setEditingTeam(!editingTeam)}
            >
              {editingTeam ? '取消编辑' : '编辑队伍信息'}
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => selectedTeam && handleDeleteTeam(selectedTeam.id)}
            >
              删除队伍
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                // Sync all accompanying judges in this team
                selectedTeamMembers
                  .filter(m => m.role === 'accompanying_judge')
                  .forEach(m => syncAccompanyingJudgeToJudges(m.id, selectedTeam));
              }}
            >
              同步评委
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTeam && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                队伍信息
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="队伍名称"
                    value={selectedTeam.teamName}
                    onChange={(e) => setSelectedTeam(prev => prev ? { ...prev, teamName: e.target.value } : null)}
                    fullWidth
                    InputProps={{ readOnly: !editingTeam }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Select
                    value={selectedTeam.category || '公开组'}
                    onChange={(e) => setSelectedTeam(prev => prev ? { ...prev, category: e.target.value } : null)}
                    fullWidth
                    disabled={!editingTeam}
                  >
                    <MenuItem value="公开组">公开组</MenuItem>
                    <MenuItem value="学校组">学校组</MenuItem>
                    <MenuItem value="邀请组">邀请组</MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="联系人"
                    value={selectedTeam.contact || selectedTeam.wechatId || ''}
                    onChange={(e) => setSelectedTeam(prev => prev ? { ...prev, contact: e.target.value } : null)}
                    fullWidth
                    InputProps={{ readOnly: !editingTeam }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>是否需要代请评委</InputLabel>
                    <Select
                      value={selectedTeam.needsAccompanyingJudge ? 'true' : 'false'}
                      onChange={(e) => setSelectedTeam(prev => prev ? { ...prev, needsAccompanyingJudge: e.target.value === 'true' } : null)}
                      disabled={!editingTeam}
                      label="是否需要代请评委"
                    >
                      <MenuItem value="true">需要</MenuItem>
                      <MenuItem value="false">不需要</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="注册时间"
                    value={new Date(selectedTeam.createdAt).toLocaleString('zh-CN')}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                {editingTeam && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={() => {
                          if (selectedTeam) {
                            handleUpdateTeamInfo(selectedTeam.id, {
                              teamName: selectedTeam.teamName,
                              category: selectedTeam.category,
                              contact: selectedTeam.contact,
                              wechatId: selectedTeam.wechatId,
                              needsAccompanyingJudge: selectedTeam.needsAccompanyingJudge
                            });
                          }
                          setEditingTeam(false);
                        }}
                      >
                        保存更改
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          // Reload team data to revert changes
                          handleViewTeamDetails(selectedTeam!);
                          setEditingTeam(false);
                        }}
                      >
                        取消
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  队员信息
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setAddMemberDialog(true)}
                >
                  添加队员
                </Button>
              </Box>
              <TableContainer component={Paper} sx={{ mt: 1 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>姓名</TableCell>
                      <TableCell>角色</TableCell>
                      <TableCell>学校</TableCell>
                      <TableCell>年级</TableCell>
                      <TableCell>联系方式</TableCell>
                      <TableCell>经验</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedTeamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <TextField
                            size="small"
                            value={member.name}
                            onChange={(e) => handleUpdateTeamMember(member.id, { name: e.target.value })}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            size="small"
                            value={member.role}
                            onChange={(e) => handleUpdateTeamMember(member.id, { role: e.target.value as TeamMember['role'] })}
                            fullWidth
                          >
                            <MenuItem value="leader">领队</MenuItem>
                            <MenuItem value="accompanying_judge">随评</MenuItem>
                            <MenuItem value="member">队员</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={member.school || ''}
                            onChange={(e) => handleUpdateTeamMember(member.id, { school: e.target.value })}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={member.year || ''}
                            onChange={(e) => handleUpdateTeamMember(member.id, { year: e.target.value })}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={member.contact || ''}
                            onChange={(e) => handleUpdateTeamMember(member.id, { contact: e.target.value })}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: 120
                            }}>
                              {member.experience || '无'}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedMember(member);
                                setExperienceDialog(true);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTeamDetailDialog(false)}>关闭</Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog
        open={addMemberDialog}
        onClose={() => setAddMemberDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>添加队员</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="姓名"
              value={newMember.name}
              onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>角色</InputLabel>
              <Select
                value={newMember.role}
                onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value as TeamMember['role'] }))}
                label="角色"
              >
                <MenuItem value="leader">领队</MenuItem>
                <MenuItem value="accompanying_judge">随评</MenuItem>
                <MenuItem value="member">队员</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="学校"
              value={newMember.school}
              onChange={(e) => setNewMember(prev => ({ ...prev, school: e.target.value }))}
              fullWidth
            />
            <TextField
              label="年级"
              value={newMember.year}
              onChange={(e) => setNewMember(prev => ({ ...prev, year: e.target.value }))}
              fullWidth
            />
            <TextField
              label="联系方式"
              value={newMember.contact}
              onChange={(e) => setNewMember(prev => ({ ...prev, contact: e.target.value }))}
              fullWidth
            />
            <TextField
              label="经验"
              value={newMember.experience}
              onChange={(e) => setNewMember(prev => ({ ...prev, experience: e.target.value }))}
              fullWidth
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMemberDialog(false)}>取消</Button>
          <Button
            onClick={handleAddMember}
            variant="contained"
            disabled={!newMember.name.trim()}
          >
            添加
          </Button>
        </DialogActions>
      </Dialog>

      {/* Judge Edit Dialog */}
      <Dialog
        open={judgeDialog}
        onClose={() => setJudgeDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          编辑评委 - {selectedJudge?.fullName}
        </DialogTitle>
        <DialogContent>
          {selectedJudge && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="姓名"
                value={selectedJudge.fullName}
                onChange={(e) => setSelectedJudge({ ...selectedJudge, fullName: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="经验"
                value={selectedJudge.experience || ''}
                onChange={(e) => setSelectedJudge({ ...selectedJudge, experience: e.target.value })}
                fullWidth
                multiline
                rows={4}
                placeholder="请输入评委的裁判经验..."
              />
              <TextField
                label="备注"
                value={selectedJudge.comments || ''}
                onChange={(e) => setSelectedJudge({ ...selectedJudge, comments: e.target.value })}
                fullWidth
                multiline
                rows={2}
                placeholder="管理员备注..."
              />
              <TextField
                label="微信"
                value={selectedJudge.wechatId || ''}
                onChange={(e) => setSelectedJudge({ ...selectedJudge, wechatId: e.target.value })}
                fullWidth
              />
              {selectedJudge.teamName && (
                <TextField
                  label="所属队伍"
                  value={selectedJudge.teamName}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  helperText="随评所属的队伍"
                />
              )}
              <FormControl fullWidth>
                <InputLabel>评委类型</InputLabel>
                <Select
                  value={selectedJudge.judgeTypes?.[0] || ''}
                  onChange={(e) => {
                    const judgeType = e.target.value as JudgeType;
                    setSelectedJudge({ ...selectedJudge, judgeTypes: judgeType ? [judgeType] : [] });
                  }}
                  label="评委类型"
                >
                  <MenuItem value="">未分类</MenuItem>
                  <MenuItem value="随队评委">随队评委</MenuItem>
                  <MenuItem value="外聘评委">外聘评委</MenuItem>
                  <MenuItem value="教学导师">教学导师</MenuItem>
                  <MenuItem value="技术裁判">技术裁判</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="剩余义务"
                type="number"
                value={selectedJudge.obligationsLeft || 0}
                onChange={(e) => setSelectedJudge({ ...selectedJudge, obligationsLeft: parseInt(e.target.value) || 0 })}
                fullWidth
                helperText="随评需要完成的义务场次数"
              />
              <TextField
                label="总义务"
                type="number"
                value={selectedJudge.totalObligations || 0}
                onChange={(e) => setSelectedJudge({ ...selectedJudge, totalObligations: parseInt(e.target.value) || 0 })}
                fullWidth
                helperText="分配的总义务场次数"
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJudgeDialog(false)}>取消</Button>
          <Button
            onClick={() => {
              if (selectedJudge) {
                handleUpdateJudge(selectedJudge.id, {
                  fullName: selectedJudge.fullName,
                  experience: selectedJudge.experience,
                  comments: selectedJudge.comments,
                  phone: selectedJudge.phone,
                  wechatId: selectedJudge.wechatId,
                  judgeTypes: selectedJudge.judgeTypes,
                  obligationsLeft: selectedJudge.obligationsLeft,
                  totalObligations: selectedJudge.totalObligations,
                  teamId: selectedJudge.teamId,
                  teamName: selectedJudge.teamName
                });
              }
              setJudgeDialog(false);
            }}
            variant="contained"
            disabled={!selectedJudge?.fullName?.trim()}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* Experience Edit Dialog */}
      <Dialog
        open={experienceDialog}
        onClose={() => setExperienceDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          编辑经验 - {selectedMember?.name}
        </DialogTitle>
        <DialogContent>
          {selectedMember && (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="经验描述"
                value={selectedMember.experience || ''}
                onChange={(e) => setSelectedMember({ ...selectedMember, experience: e.target.value })}
                fullWidth
                multiline
                rows={8}
                placeholder="请输入详细的经验描述..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExperienceDialog(false)}>取消</Button>
          <Button
            onClick={() => {
              if (selectedMember) {
                handleUpdateTeamMember(selectedMember.id, { experience: selectedMember.experience });
              }
              setExperienceDialog(false);
            }}
            variant="contained"
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;