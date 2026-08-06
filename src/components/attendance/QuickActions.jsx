import {
    Button,
    Card,
    CardContent,
    Stack,
    Typography,
} from "@mui/material";

export default function QuickActions() {
    return (
        <Card>
            <CardContent>
                <Typography mb={2} variant="h6">
                    Quick Actions
                </Typography>

                <Stack spacing={2}>
                    <Button variant="contained">
                        Mark Manual Attendance
                    </Button>

                    <Button variant="outlined">
                        Generate QR Code
                    </Button>

                    <Button variant="outlined">
                        Setup Biometric
                    </Button>

                    <Button variant="outlined">
                        Export Reports
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}   
