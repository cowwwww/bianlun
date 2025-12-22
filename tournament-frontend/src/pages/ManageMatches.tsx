import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Chip,
  Select,
  MenuItem,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { listMatchesByTournament, updateMatch, deleteMatch, createMatch, type Match } from '../services/matchService';
import { listRegistrationsByTournament, type Registration } from '../services/registrationService';
import { getTournamentTeamMembers, type TeamMember } from '../services/teamMemberService';
import { listJudges, type Judge } from '../services/judgeService';
import { Autocomplete } from '@mui/material';

const ManageMatches: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [matches, setMatches] = useState<Match[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [selectedSideA, setSelectedSideA] = useState<Registration | null>(null);
  const [selectedSideB, setSelectedSideB] = useState<Registration | null>(null);
  const [sideACompetingMembers, setSideACompetingMembers] = useState<Record<number, string>>({});
  const [sideBCompetingMembers, setSideBCompetingMembers] = useState<Record<number, string>>({});
  const [selectedJudges, setSelectedJudges] = useState<Judge[]>([]);
  const [regSearch, setRegSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // simple form for new match
  const [newMatch, setNewMatch] = useState<Partial<Match>>({
    round: '',
    room: '',
    sideAId: '',
    sideBId: '',
    judgeIds: [],
    topicId: '',
    scheduledAt: '',
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [mList, regList, memberList, judgeList] = await Promise.all([
          listMatchesByTournament(id),
          listRegistrationsByTournament(id),
          getTournamentTeamMembers(id),
          listJudges(),
        ]);
        setMatches(mList);
        setRegistrations(regList);
        setTeamMembers(memberList);
        setJudges(judgeList);
      } catch (err) {
        setError((err as Error).message || '加载对阵失败');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleUpdateField = async (matchId: string, field: keyof Match, value: string | string[]) => {
    try {
      await updateMatch(matchId, { [field]: value });
      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, [field]: value } : m))
      );
    } catch (err) {
      alert('更新失败，请重试');
      console.error(err);
    }
  };

  const handleDelete = async (matchId: string) => {
    if (!window.confirm('确认删除该对阵？')) return;
    try {
      await deleteMatch(matchId);
      setMatches((prev) => prev.filter((m) => m.id !== matchId));
    } catch (err) {
      console.error(err);
      alert('删除失败，请重试');
    }
  };

  const handleCreate = async () => {
    if (!id) return;
    if (!newMatch.sideAId || !newMatch.sideBId) {
      alert('请填写正反方队伍');
      return;
    }
    const sideASelected = Object.values(sideACompetingMembers).filter(name => name);
    const sideBSelected = Object.values(sideBCompetingMembers).filter(name => name);
    if (sideASelected.length !== 4 || sideBSelected.length !== 4) {
      alert('每个队伍必须选择4名上场队员（一辩到四辩）');
      return;
    }
    try {
      const payload: Omit<Match, 'id' | 'createdAt' | 'updatedAt'> = {
        tournamentId: id,
        round: newMatch.round || 'R?',
        room: newMatch.room || '',
        sideAId: newMatch.sideAId || '',
        sideBId: newMatch.sideBId || '',
        judgeIds: newMatch.judgeIds || [],
        topicId: newMatch.topicId || '',
        scheduledAt: newMatch.scheduledAt || '',
        result: '',
        sideACompetingMembers: Object.values(sideACompetingMembers).filter(name => name),
        sideBCompetingMembers: Object.values(sideBCompetingMembers).filter(name => name),
      };
      const created = await createMatch(payload);
      setMatches((prev) => [...prev, created]);
      setNewMatch({
        round: '',
        room: '',
        sideAId: '',
        sideBId: '',
        judgeIds: [],
        topicId: '',
        scheduledAt: '',
      });
      setSelectedSideA(null);
      setSelectedSideB(null);
      setSideACompetingMembers({});
      setSideBCompetingMembers({});
      setSelectedJudges([]);
    } catch (err) {
      alert('创建失败，请检查字段');
      console.error(err);
    }
  };

  const regMap = useMemo(
    () =>
      registrations.reduce<Record<string, string>>((acc, r) => {
        acc[r.id] = r.teamName || r.id;
        return acc;
      }, {}),
    [registrations]
  );

  const judgeMap = useMemo(
    () =>
      judges.reduce<Record<string, string>>((acc, j) => {
        acc[j.id] = `${j.fullName} (${j.judgeTypes?.[0] || '未分类'})`;
        return acc;
      }, {}),
    [judges]
  );

  const getJudgeNames = (judgeIds: string[]) => {
    return judgeIds.map(id => judgeMap[id] || id).join(', ');
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>加载中...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          对阵管理
        </Typography>
        <Typography variant="body2" color="text.secondary">
          编辑对阵、裁判、时间、结果。评分维度在赛事配置中设置。
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
          <Chip label="报名队伍/队员已载入，可下方查看" size="small" />
          <Chip label="可直接粘贴报名ID填入对阵" size="small" color="primary" />
        </Stack>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          新增对阵
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="轮次"
            value={newMatch.round || ''}
            onChange={(e) => setNewMatch((p) => ({ ...p, round: e.target.value }))}
          />
          <TextField
            label="房间"
            value={newMatch.room || ''}
            onChange={(e) => setNewMatch((p) => ({ ...p, room: e.target.value }))}
          />
        </Stack>
        <TextField
          label="辩题"
          value={newMatch.topicId || ''}
          onChange={(e) => setNewMatch((p) => ({ ...p, topicId: e.target.value }))}
          placeholder="输入比赛辩题..."
          fullWidth
          sx={{ mb: 2 }}
        />
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={registrations}
              getOptionLabel={(option) => option.teamName}
              value={selectedSideA}
              onChange={(_, newValue) => {
                setSelectedSideA(newValue);
                setNewMatch((p) => ({ ...p, sideAId: newValue?.id || '' }));
                // Reset competing members when team changes
                setSideACompetingMembers({});
              }}
              renderInput={(params) => <TextField {...params} label="正方队伍" />}
            />
            {selectedSideA && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  选择上场人员位置（包括领队和随评）：
                </Typography>
                {[1, 2, 3, 4].map(position => (
                  <Box key={position} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 60, fontWeight: 'bold' }}>
                      {position === 1 ? '一辩' : position === 2 ? '二辩' : position === 3 ? '三辩' : '四辩'}:
                    </Typography>
                    <Select
                      size="small"
                      value={sideACompetingMembers[position] || ''}
                      onChange={(e) => {
                        const selectedName = e.target.value;
                        setSideACompetingMembers(prev => ({
                          ...prev,
                          [position]: selectedName
                        }));
                      }}
                      sx={{ minWidth: 150, ml: 1 }}
                      displayEmpty
                    >
                      <MenuItem value="">
                        <em>选择队员</em>
                      </MenuItem>
                {teamMembers
                        .filter(m => m.registrationId === selectedSideA.id)
                  .map(member => (
                          <MenuItem key={member.id} value={member.name}>
                            {member.name} ({member.school || '未知学校'}) - {member.role === 'leader' ? '领队' : member.role === 'accompanying_judge' ? '随评' : '队员'}
                          </MenuItem>
                        ))}
                    </Select>
                  </Box>
                  ))}
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={registrations}
              getOptionLabel={(option) => option.teamName}
              value={selectedSideB}
              onChange={(_, newValue) => {
                setSelectedSideB(newValue);
                setNewMatch((p) => ({ ...p, sideBId: newValue?.id || '' }));
                // Reset competing members when team changes
                setSideBCompetingMembers({});
              }}
              renderInput={(params) => <TextField {...params} label="反方队伍" />}
            />
            {selectedSideB && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  选择上场人员位置（包括领队和随评）：
                </Typography>
                {[1, 2, 3, 4].map(position => (
                  <Box key={position} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 60, fontWeight: 'bold' }}>
                      {position === 1 ? '一辩' : position === 2 ? '二辩' : position === 3 ? '三辩' : '四辩'}:
                    </Typography>
                    <Select
                      size="small"
                      value={sideBCompetingMembers[position] || ''}
                      onChange={(e) => {
                        const selectedName = e.target.value;
                        setSideBCompetingMembers(prev => ({
                          ...prev,
                          [position]: selectedName
                        }));
                      }}
                      sx={{ minWidth: 150, ml: 1 }}
                      displayEmpty
                    >
                      <MenuItem value="">
                        <em>选择队员</em>
                      </MenuItem>
                {teamMembers
                        .filter(m => m.registrationId === selectedSideB.id)
                  .map(member => (
                          <MenuItem key={member.id} value={member.name}>
                            {member.name} ({member.school || '未知学校'}) - {member.role === 'leader' ? '领队' : member.role === 'accompanying_judge' ? '随评' : '队员'}
                          </MenuItem>
                        ))}
                    </Select>
                  </Box>
                  ))}
              </Box>
            )}
          </Grid>
        </Grid>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <Autocomplete
            multiple
            options={judges}
            getOptionLabel={(judge) => `${judge.fullName} (${judge.judgeTypes?.[0] || '未分类'})`}
            value={selectedJudges}
            onChange={(_, newValue) => {
              setSelectedJudges(newValue);
              setNewMatch((p) => ({ ...p, judgeIds: newValue.map(j => j.id) }));
            }}
            renderInput={(params) => (
              <TextField {...params} label="选择裁判" placeholder="选择比赛裁判..." />
            )}
            sx={{ minWidth: 300 }}
          />
          <TextField
            label="比赛时间"
            value={newMatch.scheduledAt || ''}
            onChange={(e) => setNewMatch((p) => ({ ...p, scheduledAt: e.target.value }))}
            placeholder="2026-01-24T10:00:00Z"
            fullWidth
          />
        </Stack>
        <Button variant="contained" onClick={handleCreate}>
          创建对阵
        </Button>
      </Paper>

      <Grid container spacing={2}>
        {matches.map((m) => (
          <Grid item xs={12} md={6} key={m.id}>
            <Card sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <Chip label={m.round || '未命名轮次'} color="primary" size="small" />
                  {m.room && <Chip label={m.room} size="small" />}
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  正方：{regMap[m.sideAId] || m.sideAId} ｜ 反方：{regMap[m.sideBId] || m.sideBId}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  裁判：{getJudgeNames(m.judgeIds || [])}
                </Typography>
                {m.topicId && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    辩题：{m.topicId}
                  </Typography>
                )}
                <TextField
                  fullWidth
                  label="辩题"
                  value={m.topicId || ''}
                  onChange={(e) => handleUpdateField(m.id, 'topicId', e.target.value)}
                  sx={{ mb: 1 }}
                />
                <Autocomplete
                  options={registrations}
                  getOptionLabel={(option) => option.teamName}
                  value={registrations.find(r => r.id === m.sideAId) || null}
                  onChange={(_, newValue) => handleUpdateField(m.id, 'sideAId', newValue?.id || '')}
                  renderInput={(params) => <TextField {...params} label="正方队伍" sx={{ mb: 1 }} />}
                />
                <Autocomplete
                  options={registrations}
                  getOptionLabel={(option) => option.teamName}
                  value={registrations.find(r => r.id === m.sideBId) || null}
                  onChange={(_, newValue) => handleUpdateField(m.id, 'sideBId', newValue?.id || '')}
                  renderInput={(params) => <TextField {...params} label="反方队伍" sx={{ mb: 1 }} />}
                />

                {/* Competing members selection for existing matches */}
                {m.sideAId && (
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      正方选择上场人员位置（包括领队和随评）：
                    </Typography>
                    {[1, 2, 3, 4].map(position => {
                      const currentMembers = m.sideACompetingMembers || [];
                      return (
                        <Box key={position} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ minWidth: 60, fontWeight: 'bold' }}>
                            {position === 1 ? '一辩' : position === 2 ? '二辩' : position === 3 ? '三辩' : '四辩'}:
                          </Typography>
                          <Select
                            size="small"
                            value={currentMembers[position - 1] || ''}
                            onChange={(e) => {
                              const selectedName = e.target.value;
                              const newMembers = [...(currentMembers || [])];
                              newMembers[position - 1] = selectedName;
                              // Remove empty strings and filter to max 4 members
                              const filteredMembers = newMembers.filter(name => name).slice(0, 4);
                              handleUpdateField(m.id, 'sideACompetingMembers', filteredMembers);
                            }}
                            sx={{ minWidth: 150, ml: 1 }}
                            displayEmpty
                          >
                            <MenuItem value="">
                              <em>选择队员</em>
                            </MenuItem>
                            {teamMembers
                              .filter(member => member.registrationId === m.sideAId)
                              .map(member => (
                                <MenuItem key={member.id} value={member.name}>
                                  {member.name} ({member.school || '未知学校'}) - {member.role === 'leader' ? '领队' : member.role === 'accompanying_judge' ? '随评' : '队员'}
                                </MenuItem>
                              ))}
                          </Select>
                        </Box>
                      );
                    })}
                  </Box>
                )}

                {m.sideBId && (
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      反方选择上场人员位置（包括领队和随评）：
                    </Typography>
                    {[1, 2, 3, 4].map(position => {
                      const currentMembers = m.sideBCompetingMembers || [];
                      return (
                        <Box key={position} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ minWidth: 60, fontWeight: 'bold' }}>
                            {position === 1 ? '一辩' : position === 2 ? '二辩' : position === 3 ? '三辩' : '四辩'}:
                          </Typography>
                          <Select
                            size="small"
                            value={currentMembers[position - 1] || ''}
                            onChange={(e) => {
                              const selectedName = e.target.value;
                              const newMembers = [...(currentMembers || [])];
                              newMembers[position - 1] = selectedName;
                              // Remove empty strings and filter to max 4 members
                              const filteredMembers = newMembers.filter(name => name).slice(0, 4);
                              handleUpdateField(m.id, 'sideBCompetingMembers', filteredMembers);
                            }}
                            sx={{ minWidth: 150, ml: 1 }}
                            displayEmpty
                          >
                            <MenuItem value="">
                              <em>选择队员</em>
                            </MenuItem>
                            {teamMembers
                              .filter(member => member.registrationId === m.sideBId)
                              .map(member => (
                                <MenuItem key={member.id} value={member.name}>
                                  {member.name} ({member.school || '未知学校'}) - {member.role === 'leader' ? '领队' : member.role === 'accompanying_judge' ? '随评' : '队员'}
                                </MenuItem>
                              ))}
                          </Select>
                        </Box>
                      );
                    })}
                  </Box>
                )}
                <Autocomplete
                  multiple
                  options={judges}
                  getOptionLabel={(judge) => `${judge.fullName} (${judge.judgeTypes?.[0] || '未分类'})`}
                  value={judges.filter(j => m.judgeIds?.includes(j.id))}
                  onChange={(_, newValue) => handleUpdateField(m.id, 'judgeIds', newValue.map(j => j.id))}
                  renderInput={(params) => <TextField {...params} label="裁判" sx={{ mb: 1 }} />}
                />
                <TextField
                  fullWidth
                  label="时间"
                  value={m.scheduledAt || ''}
                  onChange={(e) => handleUpdateField(m.id, 'scheduledAt', e.target.value)}
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label="结果"
                  value={m.result || ''}
                  onChange={(e) => handleUpdateField(m.id, 'result', e.target.value)}
                  sx={{ mb: 1 }}
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => handleDelete(m.id)}>
                    删除
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mt: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              报名队伍 / 队员
            </Typography>
            <Typography variant="body2" color="text.secondary">
              用于确认 circuit / 组别、队伍成员，便于对阵分配。
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          <TextField
            label="搜索队伍/队员/联系方式"
            value={regSearch}
            onChange={(e) => setRegSearch(e.target.value)}
            fullWidth
          />
        </Stack>

        {filteredRegistrations.length === 0 ? (
          <Typography color="text.secondary">暂无报名或未匹配搜索。</Typography>
        ) : (
          <Stack spacing={2}>
            {filteredRegistrations.map((reg) => (
              <Paper key={reg.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {reg.teamName}
                  </Typography>
                  {reg.category && <Chip label={reg.category} size="small" color="primary" />}
                  <Chip label={`状态: ${reg.status}`} size="small" />
                  <Chip label={`支付: ${reg.paymentStatus}`} size="small" />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  队员（{reg.participants?.length || 0}）：{reg.participants?.join('，') || '未填写'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  联系：{reg.contact || '无'} ｜ 微信：{reg.wechatId || '无'}
                </Typography>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    </Container>
  );
};

export default ManageMatches;

