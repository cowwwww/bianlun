import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface TournamentSignupProps {
  open: boolean;
  onClose: () => void;
  tournamentId: string;
}

const TournamentSignup = ({ open, onClose, tournamentId }: TournamentSignupProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>赛事报名</DialogTitle>
      <DialogContent>
        <Typography>
          报名功能正在开发中... (Tournament ID: {tournamentId})
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>关闭</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TournamentSignup;
