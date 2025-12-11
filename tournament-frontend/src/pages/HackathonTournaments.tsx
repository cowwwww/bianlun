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

const HackathonTournaments = () => {
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
        // Filter for Hackathon tournaments only
        const hackathonTournaments = data.filter(t => t.type === 'Hackathon');
        setTournaments(hackathonTournaments);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch hackathon tournaments.');
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
        <Typography>Loading hackathon tournaments...</Typography>
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
          Hackathon Tournaments
        </Typography>

        {/* Search and Filters */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid xs={12} md={8}>
              <TextField
                fullWidth
                label="Search hackathon tournaments"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, location, or description..."
                variant="outlined"
              />
            </Grid>
            <Grid xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="Technology">Technology</MenuItem>
                  <MenuItem value="AI/ML">AI/ML</MenuItem>
                  <MenuItem value="Web Development">Web Development</MenuItem>
                  <MenuItem value="Mobile Development">Mobile Development</MenuItem>
                  <MenuItem value="Blockchain">Blockchain</MenuItem>
                  <MenuItem value="Cybersecurity">Cybersecurity</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Tournament List */}
        <Grid container spacing={4}>
          {filteredTournaments.length === 0 ? (
            <Grid xs={12}>
              <Typography variant="h6" color="text.secondary" align="center">
                No hackathon tournaments found matching your search criteria.
              </Typography>
            </Grid>
          ) : (
            filteredTournaments.map((tournament) => (
              <Grid xs={12} md={4} key={tournament.id}>
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

export default HackathonTournaments; 