'use client'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import { styled } from '@mui/material/styles'

import classNames from 'classnames'

import CustomAvatar from '@core/components/mui/Avatar'

const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: 20,
    height: '100%',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[1],
    transition: 'all .3s ease',

    '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: theme.shadows[8]
    }
}))

const StatCard = ({
    title,
    stats,
    icon = 'tabler-book',
    color = 'primary',
    trendNumber,
    url
}) => {

    const router = useRouter()

    const trendColor =
        trendNumber > 0
            ? 'success'
            : trendNumber < 0
                ? 'error'
                : 'warning'

    return (
        <StyledCard
            onClick={() => router.push(url)}
        >
            <CardContent sx={{ p: 3.5 }}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                >
                    <CustomAvatar
                        skin="light"
                        color={color}
                        sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '18px'
                        }}
                    >
                        <i
                            className={classNames(icon)}
                            style={{ fontSize: 28 }}
                        />
                    </CustomAvatar>

                    {trendNumber !== undefined && (
                        <Chip
                            size="small"
                            color={trendColor}
                            variant="soft"
                            label={
                                trendNumber > 0
                                    ? `+${trendNumber}%`
                                    : `${trendNumber}%`
                            }
                        />
                    )}
                </Box>

                <Box mt={4}>
                    <Typography
                        color="text.secondary"
                        sx={{
                            fontSize: 14,
                            fontWeight: 500,
                            mb: 0.5
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: 36,
                            fontWeight: 700,
                            lineHeight: 1
                        }}
                    >
                        {stats}
                    </Typography>
                </Box>

                {trendNumber !== undefined && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 2 }}
                    >
                        Compared to last week
                    </Typography>
                )}
            </CardContent>
        </StyledCard>
    )
}

export default StatCard
