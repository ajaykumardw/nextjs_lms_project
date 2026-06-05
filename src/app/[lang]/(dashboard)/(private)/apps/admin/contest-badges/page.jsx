"use client";

import { useEffect, useState } from "react";

import { useRouter, useParams } from "next/navigation"

import { useSession } from "next-auth/react";

import {
    Box,
    Button,
    Chip,
    Paper,
    Tab,
    Tabs,
    Table,
    TableBody,
    Skeleton,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    Pagination,
    Select,
    MenuItem,
} from "@mui/material";

import Grid from "@mui/material/Grid2";

const formatDateTime = (dateString) => {
    const date = new Date(dateString);

    const day = date.getDate();

    const suffix =
        day % 10 === 1 && day !== 11
            ? "st"
            : day % 10 === 2 && day !== 12
                ? "nd"
                : day % 10 === 3 && day !== 13
                    ? "rd"
                    : "th";

    const formattedDate = date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    const [dayPart, monthPart, yearPart] = formattedDate.split(" ");

    return `${dayPart}${suffix} ${monthPart}, ${yearPart}\n${formattedTime}`;
};

const ContestBadgesPage = () => {

    const router = useRouter();

    const { lang: lang } = useParams();

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const { data: session } = useSession();
    const token = session?.user?.token;

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [tab, setTab] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const fetchContestBadge = async () => {
        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/company/contest/badge`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const result = await response.json();

            if (response.ok) {
                setData(result?.data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (API_URL && token) {
            fetchContestBadge();
        }
    }, [API_URL, token]);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    const totalItems = data?.length || 0;

    const totalPages = Math.ceil(totalItems / pageSize);

    const paginatedData = data?.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    if (loading) {
        return (
            <Box p={3}>
                <TableContainer
                    sx={{
                        overflowX: "auto",
                    }}
                >
                    <Table sx={{ minWidth: 1400 }}>
                        <TableHead>
                            <TableRow
                                sx={{
                                    bgcolor: "grey.50",
                                }}
                            >
                                {[
                                    "CONTEST NAME",
                                    "STATUS",
                                    "START DATE",
                                    "END DATE",
                                    "LEARNERS",
                                    "EVENT BADGES AWARDED",
                                    "HIGHEST SCORE",
                                    "LOWEST SCORE",
                                    "Action"
                                ].map((header) => (
                                    <TableCell
                                        key={header}
                                        align={
                                            [
                                                "LEARNERS",
                                                "EVENT BADGES AWARDED",
                                                "HIGHEST SCORE",
                                                "LOWEST SCORE",
                                            ].includes(header)
                                                ? "center"
                                                : "left"
                                        }
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: 12,
                                            color: "text.secondary",
                                            whiteSpace: "nowrap",
                                            py: 2,
                                        }}
                                    >
                                        {header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {[1, 2, , 3, 4, 5]?.map((row, index) => (
                                <TableRow
                                    key={index}
                                    hover
                                    sx={{
                                        "&:hover": {
                                            bgcolor: "action.hover",
                                        },
                                    }}
                                >
                                    <TableCell
                                        sx={{
                                            fontWeight: 500,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        <Skeleton />
                                    </TableCell>



                                    <TableCell
                                        sx={{
                                            whiteSpace: "pre-line",
                                            minWidth: 120,
                                        }}
                                    >
                                        <Skeleton />
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            whiteSpace: "pre-line",
                                            minWidth: 120,
                                        }}
                                    >
                                        <Skeleton />
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            maxWidth: 250,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        <Skeleton />
                                    </TableCell>

                                    <TableCell align="center">
                                        <Skeleton />
                                    </TableCell>

                                    <TableCell align="center">
                                        <Skeleton />
                                    </TableCell>

                                    <TableCell align="center">
                                        <Skeleton />
                                    </TableCell>

                                    <TableCell align="center">
                                        <Skeleton />
                                    </TableCell>

                                    <TableCell align="center">
                                        <IconButton
                                            color="error"
                                            size="small"
                                        >
                                            <Skeleton />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Paper
                elevation={0}
                sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    overflow: "hidden",
                    bgcolor: "background.paper",
                }}
            >
                {/* Header */}
                <Grid
                    container
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                        px: 3,
                        py: 2,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <Tabs
                        value={tab}
                        onChange={(_, value) => setTab(value)}
                    >
                        <Tab
                            label="Contest History"
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                            }}
                        />
                    </Tabs>

                    <Button
                        variant="contained"
                        sx={{
                            borderRadius: 8,
                            textTransform: "none",
                            px: 3,
                            fontWeight: 600,
                            m: 2
                        }}
                        onClick={() => {

                            router.push(`/${lang}/apps/admin/contest-badges/create`)
                        }}
                    >
                        Create New Contest
                    </Button>
                </Grid>

                {/* Table */}
                <TableContainer
                    sx={{
                        overflowX: "auto",
                    }}
                >
                    <Table sx={{ minWidth: 1400 }}>
                        <TableHead>
                            <TableRow
                                sx={{
                                    bgcolor: "grey.50",
                                }}
                            >
                                {[
                                    "CONTEST NAME",
                                    "STATUS",
                                    "START DATE",
                                    "END DATE",
                                    "LEARNERS",
                                    "EVENT BADGES AWARDED",
                                    "HIGHEST SCORE",
                                    "LOWEST SCORE",
                                    "Action"
                                ].map((header) => (
                                    <TableCell
                                        key={header}
                                        align={
                                            [
                                                "LEARNERS",
                                                "EVENT BADGES AWARDED",
                                                "HIGHEST SCORE",
                                                "LOWEST SCORE",
                                            ].includes(header)
                                                ? "center"
                                                : "left"
                                        }
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: 12,
                                            color: "text.secondary",
                                            whiteSpace: "nowrap",
                                            py: 2,
                                        }}
                                    >
                                        {header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {paginatedData?.length === 0 ? (

                                <TableRow>
                                    <TableCell
                                        colSpan={9}
                                        align="center"
                                        sx={{
                                            py: 6,
                                            color: "text.secondary",
                                        }}
                                    >
                                        No Contest Badges Found
                                    </TableCell>
                                </TableRow>

                            ) : (paginatedData?.map((row, index) => (
                                <TableRow
                                    key={index}
                                    hover
                                    sx={{
                                        "&:hover": {
                                            bgcolor: "action.hover",
                                        },
                                    }}
                                >
                                    <TableCell
                                        sx={{
                                            fontWeight: 500,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {row.contest_name}
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={row.status === "1" ? "Publish" : "Drafted"}
                                            sx={{
                                                bgcolor: "#E8F5E9",
                                                color: row.status === "1" ? "#2E7D32" : "#eb6b33",
                                                fontWeight: 600,
                                                borderRadius: 2,
                                            }}
                                            icon={
                                                <Box
                                                    sx={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: "50%",
                                                        bgcolor: row.status === "1" ? "#2E7D32" : "#eb6b33",
                                                        ml: 1,
                                                    }}
                                                />
                                            }
                                        />
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            whiteSpace: "pre-line",
                                            minWidth: 120,
                                        }}
                                    >
                                        {formatDateTime(row.start_date)}
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            whiteSpace: "pre-line",
                                            minWidth: 120,
                                        }}
                                    >
                                        {formatDateTime(row.end_date)}
                                    </TableCell>

                                    <TableCell align="center">
                                        {row.user_contest_badge_enroll?.length}
                                    </TableCell>

                                    <TableCell align="center">
                                        <Box
                                            display="flex"
                                            gap={0.5}
                                            flexWrap="wrap"
                                            justifyContent="center"
                                        >
                                            {row?.badges?.map((bg) => (
                                                <Chip
                                                    key={bg._id}
                                                    label={bg.title}
                                                    size="small"
                                                />
                                            ))}
                                        </Box>
                                    </TableCell>

                                    <TableCell align="center">
                                        {row.highestScore}
                                    </TableCell>

                                    <TableCell align="center">
                                        {row.lowestScore}
                                    </TableCell>

                                    <TableCell align="center">
                                        {
                                            row?.status === "0" && (
                                                <IconButton>
                                                    <i
                                                        className="tabler-edit"
                                                        style={{
                                                            fontSize: 18,
                                                        }}
                                                        onClick={() => {

                                                            router.push(`/${lang}/apps/admin/contest-badges/create/${row?._id}`)
                                                        }}
                                                    />
                                                </IconButton>
                                            )
                                        }
                                        <IconButton
                                            color="error"
                                            size="small"
                                        >
                                            <i
                                                className="tabler-trash"
                                                style={{
                                                    fontSize: 18,
                                                }}
                                            />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            )))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Footer */}
                <Grid
                    container
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                        p: 2,
                        borderTop: "1px solid",
                        borderColor: "divider",
                        flexWrap: "wrap",
                        gap: 2
                    }}
                >
                    <Grid
                        container
                        spacing={2}
                        alignItems="center"
                    >
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Items per page:
                        </Typography>

                        <Select
                            size="small"
                            value={pageSize}
                            onChange={e =>
                                setPageSize(Number(e.target.value))
                            }
                            sx={{
                                minWidth: 80
                            }}
                        >
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={20}>20</MenuItem>
                            <MenuItem value={50}>50</MenuItem>
                        </Select>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {totalItems === 0
                                ? "0 Items"
                                : `${(page - 1) * pageSize + 1} - ${Math.min(
                                    page * pageSize,
                                    totalItems
                                )} of ${totalItems} Items`}
                        </Typography>
                    </Grid>

                    <Grid
                        container
                        spacing={2}
                        alignItems="center"
                    >
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {page} of {totalPages || 1} pages
                        </Typography>

                        <Pagination
                            count={totalPages || 1}
                            page={page}
                            onChange={(_, value) =>
                                setPage(value)
                            }
                            color="primary"
                            shape="rounded"
                        />
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default ContestBadgesPage;
