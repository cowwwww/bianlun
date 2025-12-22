import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Chip,
  Stack,
  Divider,
  Grid,
  Tabs,
  Tab,
} from '@mui/material';
import { getTournamentById, type Tournament } from '../services/tournamentService';
import { listRegistrationsByTournament, type Registration } from '../services/registrationService';
import { listMatchesByTournament, type Match } from '../services/matchService';
import { getTournamentTeamMembers, type TeamMember } from '../services/teamMemberService';
import { listJudges, type Judge } from '../services/judgeService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tournament-tabpanel-${index}`}
      aria-labelledby={`tournament-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const TournamentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (id) {
      // Handle special case for ada-2026-fastdebate URL
      const tournamentId = id === 'ada-2026-fastdebate' ? '9jv180qufoqwmqa' : id;
      loadTournament(tournamentId);
    }
  }, [id]);

  const loadTournament = async (tournamentId: string) => {
    try {
      const data = await getTournamentById(tournamentId);
      setTournament(data);
      // Load related data
      const [regData, matchData, memberData, judgeData] = await Promise.all([
        listRegistrationsByTournament(tournamentId),
        listMatchesByTournament(tournamentId),
        getTournamentTeamMembers(tournamentId),
        listJudges(),
      ]);

      // If no registrations found, try the old tournament ID for backward compatibility
      let finalRegData = regData;
      if (regData.length === 0 && tournamentId === '5zrkihweutfv72k') {
        const oldRegData = await listRegistrationsByTournament('ada-2026-fastdebate');
        finalRegData = oldRegData;
      }
      setRegistrations(finalRegData);
      setMatches(matchData);
      setTeamMembers(memberData);
      setJudges(judgeData);
    } catch (error) {
      console.error('Error loading tournament:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>加载中...</Typography>
      </Container>
    );
  }

  if (!tournament) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>赛事未找到</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" gutterBottom>
            {tournament.name || tournament.title}
          </Typography>
          <Chip label={tournament.type} sx={{ mr: 1 }} />
          <Chip label={tournament.status} color="primary" />
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            aria-label="tournament information tabs"
            centered
            sx={{
              '& .MuiTab-root': {
                minWidth: 150,
                fontSize: '0.9rem',
                fontWeight: 500,
              }
            }}
          >
            <Tab label="📋 赛事信息" />
            <Tab label="👥 队伍信息" />
            <Tab label="👨‍⚖️ 评委信息" />
            <Tab label="🏟️ 比赛对阵" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
            赛事详细信息
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Chip label="报名开启" color="success" sx={{ mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              ADA线上辩论全国赛 - 2026
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              2025-2026
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              ADA辩论
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
              即兴辩论赛
            </Typography>

            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
              邀请函
            </Typography>

            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 3 }}>
              ADA线上辩论全国赛 - 速思锐辩
            </Typography>

            <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic' }}>
              In ADA's narrative, let curiosity endorse.
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              PART01 - INFORMATION
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              简介
            </Typography>

            <Typography variant="body1" paragraph sx={{ mb: 2 }}>
              欢迎来到 2026年ADA 全国线上辩论赛！
            </Typography>
            <Typography variant="body1" paragraph>
              作为 ADA 的第三届年度赛事，ADA 依旧坚持为辩手打造一个纯粹的辩论平台。
            </Typography>
            <Typography variant="body1" paragraph>
              本届赛事将于 1 月 24 日开启，所有赛程将在两个周末内完成。以20分钟的快速备赛机制聚焦辩论的核心要义，在每日多场的紧凑对决中，让思考在有限时间里抵达更远的地方。
            </Typography>
            <Typography variant="body1" paragraph>
              辩题横跨科技与法律，触及政策与未来，也延伸至哲学与价值本身。
          </Typography>
          <Typography variant="body1" paragraph>
              诚挚邀请您再次与全国的思辨者汇聚。
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              PART02 - INFORMATION
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              赛事信息
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body1"><strong>赛事名称:</strong> ADA线上辩论全国赛2026 - 速思锐辩</Typography>
              <Typography variant="body1"><strong>其他名称：</strong>ADA寒假即兴辩论赛-2026</Typography>
              <Typography variant="body1"><strong>赛事语⾔:</strong> 中⽂</Typography>
              <Typography variant="body1"><strong>赛事规模:</strong> 8+支队伍</Typography>
              <Typography variant="body1"><strong>队伍人数：</strong>4-12人/队</Typography>
              <Typography variant="body1"><strong>参赛要求：</strong>无限制级</Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              PART03 - REGISTRATION
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              报名信息
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>报名链接：</strong>
                <a href="https://wj.qq.com/s2/25118307/7bdc/" target="_blank" rel="noopener noreferrer">
                  https://wj.qq.com/s2/25118307/7bdc/
                </a>
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>普通报名：</strong>80元/队+100元保证金/队</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}><strong>队伍要求：</strong>每队需有⼀名队员和⾄少⼀名随评，若无随评主办方可代请。</Typography>

              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>随队评委要求履历要求以及义务：</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>1. 评赛经验：担任过⽹辩赛、地区赛评委，具有丰富评赛经验。</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>2. 比赛经验：下列任一条件的履历五条及以上，且至少三条履历携带一场佳辩：</Typography>
              <Box sx={{ ml: 2, mb: 2 }}>
                <Typography variant="body1">a.省级实体赛8队冠亚，以此类推。</Typography>
                <Typography variant="body1">b.新国辩，世界杯，世锦赛上赛。</Typography>
                <Typography variant="body1">c.网辩赛1/8履历。</Typography>
                <Typography variant="body1">d.市级地区赛冠亚、省级赛事四强。</Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 1 }}>随评义务场次为n+1场，若需代请评委费用为50元一位一场。</Typography>
              <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                注：本赛设有申诉机制。队伍需完整阅读《赛事章程》和《队伍须知》，随评需完整阅读《评委须知》。
          </Typography>
        </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              PART04 - AWARD
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              奖金设置
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">🏆 <strong>冠军队伍：</strong>800 元奖⾦+电子证书</Typography>
              <Typography variant="body1">🥈 <strong>亚军队伍：</strong>500 元奖⾦+电子证书</Typography>
              <Typography variant="body1">⭐ <strong>全程佳辩：</strong>200元奖金+电子证书</Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              PART05 - SCHEDULE
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              赛事赛程
          </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">📅 <strong>1 月 10 日：</strong>辩题库公式</Typography>
              <Typography variant="body1">📝 <strong>1 月 21 日：</strong>比赛报名截⽌</Typography>
              <Typography variant="body1">🎉 <strong>1 月 22 日：</strong>开幕式：对阵公布，队伍巡礼，评委巡礼</Typography>
              <Typography variant="body1">🏁 <strong>1 月 24 日：</strong>比赛开启</Typography>
              <Typography variant="body1">⚡ <strong>1 月 25 日 - 31日：</strong>比赛进⾏（预计）</Typography>
              <Typography variant="body1">🎊 <strong>2 月 8 月：</strong>闭幕式</Typography>
        </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              PART06 - FORMAT
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              赛事赛制
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>20分00秒：</strong>辩题公布，备赛时间</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>2分00秒：</strong> 正方一辩立论陈词</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>1分30秒：</strong>反方四辩质询正方一辩（单边计时）</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>2分00秒：</strong>反方一辩立论陈词</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>1分30 秒：</strong>正方四辩质询反方一辩（单边计时）</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>1分30秒：</strong>正方二辩申论</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>1分30秒：</strong>反方二辩申论</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>1分30秒：</strong>正方二辩与反方二辩对辩</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>2分00秒：</strong>正方三辩盘问（单边计时）</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>2分00秒：</strong>反方三辩盘问（单边计时）</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>1分30 秒：</strong>正方三辩盘问小结</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>1分30秒：</strong>反方三辩盘问小结</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>各4分00秒：</strong>自由辩论环节</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>3分00秒：</strong>反方四辩总结陈词</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>3分00秒：</strong>正方四辩总结陈词</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>4分00秒：</strong>数据检验环节(如有)</Typography>
            </Box>

        <Divider sx={{ my: 3 }} />

            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              PART06 - ADDITIONAL INFO
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              其他信息
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>队伍报名:</strong> <a href="https://wj.qq.com/s2/25118307/7bdc/" target="_blank" rel="noopener noreferrer">https://wj.qq.com/s2/25118307/7bdc/</a>
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>评委报名:</strong> <a href="https://wj.qq.com/s2/25118581/a632/" target="_blank" rel="noopener noreferrer">https://wj.qq.com/s2/25118581/a632/</a>
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>主席报名:</strong> <a href="https://wj.qq.com/s2/25118641/5db6/" target="_blank" rel="noopener noreferrer">https://wj.qq.com/s2/25118641/5db6/</a>
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>赛事咨询群:</strong> 二维码于ArcX Academy公众号输入栏目。
              </Typography>
              <Typography variant="body1">
                <strong>赛事文件:</strong> 《赛事章程》、《队伍需知》和《评委需知》于ArcX Academy公众号主页
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ mt: 3, fontStyle: 'italic', textAlign: 'center' }}>
              END.
            </Typography>
          </Box>

        {tournament.scoringConfig?.length ? (
          <>
              <Divider sx={{ my: 3 }} />
            <Typography variant="h5" gutterBottom>
              评分维度（主办方设定）
            </Typography>
            <Stack spacing={1} sx={{ mb: 3 }}>
              {tournament.scoringConfig.map((d) => (
                <Typography key={d.key} variant="body2" color="text.secondary">
                  {d.label}：满分 {d.max}{d.weight ? `，权重 ${d.weight}` : ''} 分
                </Typography>
              ))}
            </Stack>
          </>
        ) : null}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
            参赛队伍信息
        </Typography>

        {registrations.length === 0 ? (
          <Typography color="text.secondary">暂无报名信息</Typography>
        ) : (
            <Stack spacing={3}>
              {registrations.map((reg) => {
                const teamMembersList = teamMembers.filter(m => m.registrationId === reg.id);
                const leader = teamMembersList.find(m => m.role === 'leader');
                const accompanyingJudge = teamMembersList.find(m => m.role === 'accompanying_judge');
                const regularMembers = teamMembersList.filter(m => m.role === 'member');

                return (
                  <Paper key={reg.id} variant="outlined" sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {reg.teamName}
                      </Typography>
                    </Box>

                    {leader && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                          领队
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {leader.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {leader.school && `学校：${leader.school}`}
                            {leader.year && ` ｜ ${leader.year}`}
                          </Typography>
                        </Paper>
                      </Box>
                    )}

                    {regularMembers.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'secondary.main', mb: 1 }}>
                          队员 ({regularMembers.length}人)
                        </Typography>
                        <Grid container spacing={2}>
                          {regularMembers.map((member) => (
                            <Grid item xs={12} sm={6} md={4} key={member.id}>
                              <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {member.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {member.school && `学校：${member.school}`}
                                  {member.year && ` ｜ ${member.year}`}
                                </Typography>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    {accompanyingJudge && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'info.main', mb: 1 }}>
                          随队评委
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'info.50' }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {accompanyingJudge.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {accompanyingJudge.school && `学校：${accompanyingJudge.school}`}
                            {accompanyingJudge.year && ` ｜ ${accompanyingJudge.year}`}
                          </Typography>
                          {accompanyingJudge.experience && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                裁判履历：
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                {accompanyingJudge.experience}
                              </Typography>
                            </Box>
                          )}
                        </Paper>
                      </Box>
                    )}
                  </Paper>
                );
              })}
            </Stack>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
            随队评委信息
          </Typography>

          {teamMembers.filter(m => m.role === 'accompanying_judge').length === 0 ? (
            <Typography color="text.secondary">暂无随队评委信息</Typography>
          ) : (
            <Grid container spacing={2}>
              {teamMembers.filter(m => m.role === 'accompanying_judge').map((judge) => (
                <Grid item xs={12} md={6} key={judge.id}>
                  <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {judge.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {judge.school && `学校：${judge.school}`}
                      {judge.year && ` ｜ ${judge.year}`}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      所属队伍：{registrations.find(r => r.id === judge.registrationId)?.teamName || '未知'}
                    </Typography>
                    {judge.experience && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                          裁判履历：
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', lineHeight: 1.4 }}>
                          {judge.experience}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
            比赛对阵
        </Typography>

        {matches.length === 0 ? (
          <Typography color="text.secondary">暂未排出对阵</Typography>
        ) : (
          <Grid container spacing={2}>
            {matches.map((m) => (
              <Grid item xs={12} md={6} key={m.id}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      {m.round || '未命名轮次'} {m.topicId ? `｜${m.topicId}` : '｜未设置辩题'}
                    </Typography>

                    {m.room && (
                      <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                        <strong>房间：</strong>{m.room}
                      </Typography>
                    )}

                    {m.scheduledAt && (
                      <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                        <strong>时间：</strong>{new Date(m.scheduledAt).toLocaleString('zh-CN')}
                      </Typography>
                    )}

                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>正方：</strong>{m.sideAId === 'c47qkyf71jdy676' ? '橙子酱队' : (registrations.find(r => r.id === m.sideAId)?.teamName || m.sideAId || '待定')}
                    </Typography>
                    {(m.sideACompetingMembers && m.sideACompetingMembers.length > 0) || m.sideAId === 'c47qkyf71jdy676' ? (
                      <Box sx={{ ml: 2 }}>
                        {(m.sideACompetingMembers && m.sideACompetingMembers.length > 0 ? m.sideACompetingMembers : ['冯文静', '叶宇亮', '施少坦', '罗涵玥']).map((member, index) => (
                          <Typography key={index} variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                            {index === 0 ? '一辩' : index === 1 ? '二辩' : index === 2 ? '三辩' : '四辩'}：{member}
                  </Typography>
                        ))}
                      </Box>
                    ) : null}

                    <Typography variant="body2" sx={{ mt: 1, mb: 0.5 }}>
                      <strong>反方：</strong>{m.sideBId === '2iwosh9g9x7apxu' ? '显允—啊！打～' : (registrations.find(r => r.id === m.sideBId)?.teamName || m.sideBId || '待定')}
                  </Typography>
                    {(m.sideBCompetingMembers && m.sideBCompetingMembers.length > 0) || m.sideBId === '2iwosh9g9x7apxu' ? (
                      <Box sx={{ ml: 2 }}>
                        {(m.sideBCompetingMembers && m.sideBCompetingMembers.length > 0 ? m.sideBCompetingMembers : ['黄华', '刘畅', '吴昊森', '翁一凡']).map((member, index) => (
                          <Typography key={index} variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                            {index === 0 ? '一辩' : index === 1 ? '二辩' : index === 2 ? '三辩' : '四辩'}：{member}
                  </Typography>
                        ))}
                      </Box>
                    ) : null}

                  <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>评委：</strong>{m.judgeIds?.length ? m.judgeIds.map(judgeId => judges.find(j => j.id === judgeId)?.fullName || judgeId).join('、') : '待分配'}
                    </Typography>

                    {m.result && (
                      <Typography variant="body2" color="primary.main" sx={{ mt: 1, fontWeight: 600 }}>
                        结果：{m.result}
                      </Typography>
                  )}

                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default TournamentDetail;
