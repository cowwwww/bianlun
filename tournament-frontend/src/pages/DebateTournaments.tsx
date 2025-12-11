import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Container,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getTournaments, type Tournament } from '../services/tournamentService';

// Enhanced fuzzy match function for better search results
const fuzzyMatch = (text: string, query: string): boolean => {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  // Direct match
  if (lowerText.includes(lowerQuery)) return true;
  
  // Fuzzy match
  let textIndex = 0;
  let queryIndex = 0;
  
  while (queryIndex < lowerQuery.length && textIndex < lowerText.length) {
    if (lowerQuery[queryIndex] === lowerText[textIndex]) {
      queryIndex++;
    }
    textIndex++;
  }
  
  // Allow for some typos by checking if we found most of the characters
  return queryIndex >= lowerQuery.length * 0.7;
};

const DebateTournaments = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await getTournaments();
        // Filter for Debate tournaments only
        const debateTournaments = data.filter(t => t.type === 'Debate');
        setTournaments(debateTournaments);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch debate tournaments.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchTournaments();
  }, []);

  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesSearch = fuzzyMatch(tournament.title, searchQuery) || 
                         fuzzyMatch(tournament.description || '', searchQuery) ||
                         fuzzyMatch(tournament.location, searchQuery);
    const matchesCategory = !selectedCategory || tournament.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <Container>
        <Typography>Loading debate tournaments...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Debate Tournaments
        </Typography>

        {/* Search and Filters */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Search debate tournaments"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, location, or description..."
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="Academic">Academic</MenuItem>
                  <MenuItem value="Policy">Policy</MenuItem>
                  <MenuItem value="Public Forum">Public Forum</MenuItem>
                  <MenuItem value="Lincoln-Douglas">Lincoln-Douglas</MenuItem>
                  <MenuItem value="Parliamentary">Parliamentary</MenuItem>
                  <MenuItem value="World Schools">World Schools</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Tournament List */}
        <Grid container spacing={4}>
          {filteredTournaments.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="h6" color="text.secondary" align="center">
                No debate tournaments found matching your search criteria.
              </Typography>
            </Grid>
          ) : (
            filteredTournaments.map((tournament) => (
              <Grid item xs={12} md={4} key={tournament.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    },
                  }}
                  onClick={() => navigate(`/tournaments/${tournament.id}`)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={tournament.image}
                    alt={tournament.title}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h3">
                      {tournament.title}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Chip label={tournament.type} size="small" color="primary" />
                      <Chip label={tournament.category} size="small" />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {tournament.date}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tournament.location}
                    </Typography>
                    {tournament.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {tournament.description.substring(0, 100)}...
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default DebateTournaments; 