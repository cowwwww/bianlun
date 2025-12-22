import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Chip,
  Stack,
  Grid,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon, Visibility as VisibilityIcon, Download as DownloadIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { listResources, type Resource } from '../services/resourceService';

const Resources: React.FC = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Resource | null>(null);

  const categoryOptions = [
    { value: '', label: '全部分类' },
    { value: 'transcript', label: '赛事转写' },
    { value: 'resource-pack', label: '资料包' },
    { value: 'first-debate', label: '一辩稿' },
    { value: 'second-debate', label: '二辩稿' },
    { value: 'third-debate', label: '三辩稿' },
    { value: 'fourth-debate', label: '四辩稿' },
    { value: 'experience-sharing', label: '经验分享' },
    { value: 'other', label: '其他' },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await listResources();
        setResources(data);
      } catch (err) {
        console.error('Error loading resources:', err);
        setError('加载资源失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.topic || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = !selectedCategory || r.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            资源库
          </Typography>
          <Typography variant="body2" color="text.secondary">
            来自 PocketBase 的资料与稿件
          </Typography>
        </Box>
        <Button startIcon={<AddIcon />} variant="contained" onClick={() => navigate('/addresource')}>
          上传资源
        </Button>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="搜索资源标题/描述/话题"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          label="分类"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          sx={{ minWidth: 180 }}
          SelectProps={{ native: true }}
        >
          {categoryOptions.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </TextField>
      </Stack>

      <Grid container spacing={2}>
        {filtered.map((r) => (
          <Grid item xs={12} md={4} key={r.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Chip label={r.category || '未分类'} size="small" sx={{ mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {r.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {r.description || '无描述'}
                </Typography>
                {r.topic && (
                  <Typography variant="body2" color="text.secondary">
                    话题：{r.topic}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button size="small" startIcon={<VisibilityIcon />} onClick={() => setPreview(r)}>
                  预览
                </Button>
                {r.fileUrl && (
                  <Button size="small" startIcon={<DownloadIcon />} href={r.fileUrl} target="_blank" rel="noreferrer">
                    下载
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {preview && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            预览：{preview.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {preview.description || '无描述'}
          </Typography>
          {preview.fileUrl ? (
            <Button variant="contained" href={preview.fileUrl} target="_blank" rel="noreferrer">
              打开文件
            </Button>
          ) : (
            <Alert severity="info">暂无文件可预览</Alert>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default Resources;



