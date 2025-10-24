/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';

function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const history = await getHistoryOfUser();
            console.log('History data:', history);
            setMeetings(history || []);
            setError('');
        } catch (err) {
            console.error('Error fetching history:', err);
            setError('Failed to fetch meeting history');
            setOpenSnackbar(true);
            setMeetings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Invalid Date';
        }
    };

    const handleJoinMeeting = (meetingCode) => {
        if (meetingCode) {
            navigate(`/${meetingCode}`);
        }
    };

    const handleCopyCode = (meetingCode) => {
        navigator.clipboard.writeText(meetingCode);
        setError('Meeting code copied!');
        setOpenSnackbar(true);
    };

    if (loading) {
        return (
            <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                minHeight="100vh"
                sx={{
                    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
                }}
            >
                <CircularProgress sx={{ color: '#00d4ff' }} size={60} />
            </Box>
        );
    }

    return (
        <Box sx={{ 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
            p: 3
        }}>
            <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
                <Typography 
                    variant="h3" 
                    gutterBottom 
                    sx={{ 
                        mb: 4,
                        fontWeight: 700,
                        background: 'linear-gradient(45deg, #00d4ff 30%, #00ff88 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textAlign: 'center'
                    }}
                >
                    Meeting History
                </Typography>

                {meetings && meetings.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {meetings.map((meeting, index) => (
                            <Card 
                                key={meeting._id || index} 
                                sx={{ 
                                    background: 'rgba(26, 26, 46, 0.8)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(0, 212, 255, 0.2)',
                                    borderRadius: 3,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 8px 30px rgba(0, 212, 255, 0.3)',
                                        border: '1px solid rgba(0, 212, 255, 0.5)',
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Typography 
                                        variant="h5" 
                                        gutterBottom
                                        sx={{ 
                                            color: '#00d4ff',
                                            fontWeight: 600,
                                            mb: 2
                                        }}
                                    >
                                        📹 {meeting.Meeting || meeting.meeting_code || 'N/A'}
                                    </Typography>
                                    
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        gap: 1,
                                        mb: 1 
                                    }}>
                                        <Typography 
                                            variant="body1" 
                                            sx={{ 
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}
                                        >
                                            👤 <strong>User:</strong> {meeting.name_id || meeting.user_id || 'Unknown'}
                                        </Typography>

                                        <Typography 
                                            variant="body1" 
                                            sx={{ 
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}
                                        >
                                            📅 <strong>Date:</strong> {meeting.date ? formatDate(meeting.date) : 'N/A'}
                                        </Typography>
                                    </Box>
                                </CardContent>
                                
                                <CardActions sx={{ px: 3, pb: 3, gap: 2 }}>
                                    <Button 
                                        variant="contained"
                                        onClick={() => handleJoinMeeting(meeting.Meeting || meeting.meeting_code)}
                                        sx={{
                                            background: 'linear-gradient(45deg, #00d4ff 30%, #00ff88 90%)',
                                            color: '#000',
                                            fontWeight: 600,
                                            px: 3,
                                            py: 1,
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #00ff88 30%, #00d4ff 90%)',
                                                transform: 'scale(1.05)',
                                            }
                                        }}
                                    >
                                        Join Again
                                    </Button>
                                    <Button 
                                        variant="outlined"
                                        onClick={() => handleCopyCode(meeting.Meeting || meeting.meeting_code)}
                                        sx={{
                                            borderColor: '#00d4ff',
                                            color: '#00d4ff',
                                            fontWeight: 600,
                                            px: 3,
                                            py: 1,
                                            '&:hover': {
                                                borderColor: '#00ff88',
                                                color: '#00ff88',
                                                background: 'rgba(0, 212, 255, 0.1)',
                                            }
                                        }}
                                    >
                                        Copy Code
                                    </Button>
                                </CardActions>
                            </Card>
                        ))}
                    </Box>
                ) : (
                    <Box 
                        textAlign="center" 
                        py={10}
                        sx={{ 
                            background: 'rgba(26, 26, 46, 0.6)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: 4,
                            border: '2px dashed rgba(0, 212, 255, 0.3)',
                        }}
                    >
                        <Typography 
                            variant="h4" 
                            gutterBottom
                            sx={{ 
                                color: '#00d4ff',
                                fontWeight: 600,
                                mb: 2
                            }}
                        >
                            📭 No Meeting History
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '1.1rem'
                            }}
                        >
                            Your meeting history will appear here once you join or create meetings
                        </Typography>
                    </Box>
                )}

                <Snackbar 
                    open={openSnackbar} 
                    autoHideDuration={4000} 
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert 
                        onClose={handleCloseSnackbar} 
                        severity={error.includes('copied') ? 'success' : 'error'}
                        variant="filled"
                        sx={{
                            background: error.includes('copied') 
                                ? 'linear-gradient(45deg, #00ff88 30%, #00d4ff 90%)'
                                : 'linear-gradient(45deg, #ff1744 30%, #ff5722 90%)',
                            color: '#000',
                            fontWeight: 600
                        }}
                    >
                        {error}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
}

export default History;