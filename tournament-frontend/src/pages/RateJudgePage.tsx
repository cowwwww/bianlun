import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  Rating as MuiRating,
  CircularProgress,
} from '@mui/material';
import pb from '../services/pocketbase';
import { auth } from '../services/authService';

const RateJudgePage = () => {
  const [judgeId, setJudgeId] = useState('');
  const [judgeName, setJudgeName] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyRated, setAlreadyRated] = useState(false);

  const checkAlreadyRated = async (userId: string, judgeIdValue: string): Promise<boolean> => {
    const res = await pb.collection('judge_ratings').getList(1, 1, {
      filter: `userId="${userId}" && judgeId="${judgeIdValue}"`,
    });
    return res.items.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setAlreadyRated(false);
    setLoading(true);
    try {
      const user = auth.getCurrentUser();
      if (!user) throw new Error('请先登录');
      if (!judgeId || !judgeName || !rating) {
        setError('Please select a judge and rating.');
        setLoading(false);
        return;
      }
      const hasRated = await checkAlreadyRated(user.id, judgeId);
      if (hasRated) {
        setAlreadyRated(true);
        setLoading(false);
        return;
      }
      await pb.collection('judge_ratings').create({
        userId: user.id,
        judgeId,
        judgeName,
        rating,
        review,
      });
      setSuccess(true);
      setReview('');
      setRating(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit rating.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        Rate a Judge
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          label="Judge ID"
          value={judgeId}
          onChange={e => setJudgeId(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Judge Name"
          value={judgeName}
          onChange={e => setJudgeName(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ mr: 2 }}>Rating:</Typography>
          <MuiRating
            name="judge-rating"
            value={rating}
            onChange={(_, value) => setRating(value)}
            precision={1}
            max={5}
          />
        </Box>
        <TextField
          label="Review (optional)"
          value={review}
          onChange={e => setReview(e.target.value)}
          fullWidth
          multiline
          minRows={2}
          sx={{ mb: 2 }}
        />
        {alreadyRated && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            You have already rated this judge.
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Thank you for your rating!
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          fullWidth
        >
          {loading ? <CircularProgress size={24} /> : 'Submit Rating'}
        </Button>
      </Box>
    </Container>
  );
};

export default RateJudgePage; 