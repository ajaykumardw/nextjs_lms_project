"use client";

import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";

import {
  Card,
  CardContent,
  Typography,
  RadioGroup,
  Skeleton,
  FormControlLabel,
  Radio,
  Button,
} from "@mui/material";

import Grid from "@mui/material/Grid2";
import { toast } from "react-toastify";

const CertificateSetting = () => {
  const { data: session } = useSession();

  const token = session?.user?.token;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [data, setData] = useState(null);
  const [values, setValues] = useState("");

  // =========================
  // Fetch Settings
  // =========================
  const fetchCertificateSetting = async () => {
    try {
      const response = await fetch(
        `${API_URL}/company/certificate/setting/data`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        const value = result?.data;

        setValues(value?.certificateSettingId || "");
        setData(value);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch certificate settings");
    }
  };

  // =========================
  // Reset
  // =========================
  const reset = () => {
    fetchCertificateSetting();
  };

  // =========================
  // Initial Load
  // =========================
  useEffect(() => {
    if (API_URL && token) {
      setData(null);
      fetchCertificateSetting();
    }
  }, [API_URL, token]);

  // =========================
  // Submit
  // =========================
  const handleSubmit = async () => {
    try {
      const payload = {
        certificateSettingId: values,
      };

      const response = await fetch(
        `${API_URL}/company/certificate/setting/data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success("Certificate setting updated successfully", {
          autoClose: 1000,
        });

        fetchCertificateSetting();
      } else {
        toast.error(
          result?.message || "Failed to update certificate setting"
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  // =========================
  // Loading State
  // =========================
  if (!data) {
    return (
      <Card sx={{ p: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Skeleton width="60%" />
          </Typography>

          <Typography variant="subtitle2" gutterBottom>
            <Skeleton width="40%" />
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Skeleton variant="rectangular" height={80} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Skeleton variant="rectangular" height={80} />
            </Grid>
          </Grid>

          <Grid container justifyContent="flex-start" sx={{ mt: 3 }}>
            <Skeleton variant="rectangular" width={120} height={40} />
          </Grid>
        </CardContent>
      </Card>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <Card sx={{ p: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Certificate Settings <span style={{ color: "red" }}>*</span>
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          {
            `Generate certificate based on content type`}
        </Typography>

        <RadioGroup
          row
          value={values}
          onChange={(e) => setValues(e.target.value)}
          sx={{
            gap: 2,
            mt: 4,
            flexWrap: "wrap",
          }}
        >
          {data?.certificate_setting_data?.map((setting) => {
            const isSelected = values === setting?._id;

            return (
              <Card
                key={setting?._id}
                variant="outlined"
                onClick={() => setValues(setting?._id)}
                sx={{
                  p: 2,
                  width: 300,
                  cursor: "pointer",
                  borderWidth: 2,
                  transition: "0.2s",
                  borderColor: isSelected
                    ? "primary.main"
                    : "grey.300",
                  backgroundColor: isSelected
                    ? "action.selected"
                    : "background.paper",

                  "&:hover": {
                    borderColor: "primary.main",
                  },
                }}
              >
                <FormControlLabel
                  value={setting?._id}
                  control={<Radio checked={isSelected} />}
                  label={
                    <div>
                      <Typography variant="body1" fontWeight={600}>
                        {setting?.title}
                      </Typography>

                      {setting?.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {setting?.description}
                        </Typography>
                      )}
                    </div>
                  }
                  sx={{
                    alignItems: "flex-start",
                    width: "100%",
                    m: 0,
                  }}
                />
              </Card>
            );
          })}
        </RadioGroup>

        <Grid
          container
          gap={2}
          justifyContent="flex-start"
          sx={{ mt: 4 }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!values}
          >
            Save
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={reset}
          >
            Reset
          </Button>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CertificateSetting;
