import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Stack,
} from '@mui/material';
import { createRegistration } from '../services/registrationService';

const RegisterTournament = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [participantsText, setParticipantsText] = useState('');
  const [category, setCategory] = useState('');
  const [contact, setContact] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!teamName.trim()) {
      setError('请填写队伍名称');
      return;
    }
    const participants = participantsText
      .split(/[\n,，]/)
      .map((p) => p.trim())
      .filter(Boolean);
    try {
      setLoading(true);
      setError(null);
      await createRegistration({
        tournamentId: id,
        teamName: teamName.trim(),
        participants,
        category: category.trim() || undefined,
        contact: contact.trim() || undefined,
        notes: note.trim() || undefined,
        wechatId: contact.trim() || undefined,
        paymentStatus: 'pending',
        status: 'pending',
        createdAt: '',
        updatedAt: '',
        id: '',
      } as any);
      setSuccess(true);
      setTimeout(() => navigate(`/tournaments/${id}`), 800);
    } catch (err) {
      setError((err as Error).message || '报名失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        报名参赛
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        赛事ID：{id}
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">报名成功，返回赛事页查看</Alert>}

          <TextField
            label="队伍名称"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="队员（换行或逗号分隔）"
            value={participantsText}
            onChange={(e) => setParticipantsText(e.target.value)}
            required
            fullWidth
            multiline
            minRows={3}
          />
          <TextField
            label="组别/分区（可选）"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            fullWidth
          />
          <TextField
            label="联系方式 / 微信号（可选）"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            fullWidth
          />
          <TextField
            label="备注（可选）"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />

          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? '提交中...' : '提交报名'}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default RegisterTournament;



