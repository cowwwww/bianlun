import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Stack,
  Divider,
} from '@mui/material';
import { getMatchById } from '../services/matchService';
import { submitScore } from '../services/scoreService';
import { auth } from '../services/authService';
import { getTournamentById, type Tournament } from '../services/tournamentService';

const MatchScorePage = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const [sideAScore, setSideAScore] = useState(0);
  const [sideBScore, setSideBScore] = useState(0);
  const [comments, setComments] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [matchTitle, setMatchTitle] = useState('');
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [dimensionScores, setDimensionScores] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      if (!matchId) return;
      try {
        const match = await getMatchById(matchId);
        const user = auth.getCurrentUser();
        const isJudge = match?.judgeIds?.includes(user?.id || '');
        setAllowed(!!isJudge);
        if (match) {
          setMatchTitle(`${match.round || '对阵'} ${match.room || ''}`.trim());
          if (match.tournamentId) {
            const t = await getTournamentById(match.tournamentId);
            setTournament(t);
            if (t?.scoringConfig?.length) {
              const init: Record<string, number> = {};
              t.scoringConfig.forEach((d) => {
                init[d.key] = 0;
              });
              setDimensionScores(init);
            }
          }
        }
        if (!isJudge) {
          setError('您不在本场对阵的评委名单内');
        }
      } catch (err) {
        setError((err as Error).message || '加载对阵失败');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [matchId]);

  const totalFromDimensions =
    tournament?.scoringConfig?.length && Object.keys(dimensionScores).length
      ? tournament.scoringConfig.reduce((sum, d) => {
          const raw = dimensionScores[d.key] || 0;
          const weighted = d.weight ? raw * d.weight : raw;
          return sum + weighted;
        }, 0)
      : sideAScore;

  const handleSubmit = async () => {
    if (!matchId) return;
    try {
      setError(null);
      await submitScore({
        matchId,
        sideAScore: totalFromDimensions,
        sideBScore,
        comments: buildComment(comments, tournament?.scoringConfig, dimensionScores),
      });
      setSuccess(true);
      setTimeout(() => navigate(-1), 800);
    } catch (err) {
      setError((err as Error).message || '提交评分失败');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          录入评分
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          对阵：{matchTitle || matchId}（评分规则与分值由主办方决定）
        </Typography>

        <Stack spacing={2}>
          {error && <Alert severity={allowed ? 'error' : 'warning'}>{error}</Alert>}
          {success && <Alert severity="success">提交成功</Alert>}

          {tournament?.scoringConfig?.length ? (
            <>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                评分维度（主办方配置）
              </Typography>
              {tournament.scoringConfig.map((dim) => (
                <TextField
                  key={dim.key}
                  label={`${dim.label}（满分 ${dim.max}${dim.weight ? `，权重 ${dim.weight}` : ''}）`}
                  type="number"
                  value={dimensionScores[dim.key] ?? 0}
                  onChange={(e) =>
                    setDimensionScores((prev) => ({
                      ...prev,
                      [dim.key]: Math.min(Number(e.target.value), dim.max),
                    }))
                  }
                  inputProps={{ min: 0, max: dim.max }}
                  sx={{ mb: 1 }}
                />
              ))}
              <Typography variant="body2" color="text.secondary">
                当前总分：{totalFromDimensions}（按维度求和，实际解释以主办方为准）
              </Typography>
              <Divider />
              <TextField
                label="评语（可选）"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                multiline
                minRows={2}
              />
            </>
          ) : (
            <>
              <TextField
                label="正方得分"
                type="number"
                value={sideAScore}
                onChange={(e) => setSideAScore(Number(e.target.value))}
                inputProps={{ min: 0 }}
              />
              <TextField
                label="反方得分"
                type="number"
                value={sideBScore}
                onChange={(e) => setSideBScore(Number(e.target.value))}
                inputProps={{ min: 0 }}
              />
              <TextField
                label="评语（可选）"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                multiline
                minRows={2}
              />
            </>
          )}

          <Button variant="contained" onClick={handleSubmit} disabled={!allowed || loading}>
            {allowed ? '提交评分' : '无权限'}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

function buildComment(
  base: string,
  scoringConfig?: Array<{ key: string; label: string }>,
  dimensionScores?: Record<string, number>
): string {
  if (!scoringConfig?.length || !dimensionScores) return base;
  const detail = scoringConfig
    .map((d) => `${d.label}: ${dimensionScores[d.key] ?? 0}`)
    .join(' | ');
  return base ? `${base}\n维度: ${detail}` : `维度: ${detail}`;
}

export default MatchScorePage;

