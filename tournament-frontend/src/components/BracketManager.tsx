import { Paper, Typography } from '@mui/material';

interface BracketManagerProps {
  tournamentId: string;
}

const BracketManager = ({ tournamentId }: BracketManagerProps) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        赛程管理
      </Typography>
      <Typography color="text.secondary">
        赛程管理功能正在开发中... (Tournament ID: {tournamentId})
      </Typography>
    </Paper>
  );
};

export default BracketManager;
