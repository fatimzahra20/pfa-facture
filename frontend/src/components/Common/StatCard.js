// src/components/Common/StatCard.js
import React from "react";
import { Card, CardContent, Box, Typography, Avatar } from "@mui/material";
import { TrendingUp } from "@mui/icons-material";

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
}) => {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        height: "100%",
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        minHeight: 124,
      }}
    >
      <CardContent sx={{ p: 2, height: "100%" }}>
        <Box
          display="flex"
          alignItems="stretch"
          justifyContent="space-between"
          height="100%"
          gap={2}
        >
          <Box
            flex={1}
            minWidth={0}
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={500}
              minHeight={22}
            >
              {title}
            </Typography>
            <Box>
              <Typography
                variant="h5"
                fontWeight={700}
                color="text.primary"
                lineHeight={1}
              >
                {value}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                mt={1}
                display="block"
                minHeight={18}
              >
                {subtitle || " "}
              </Typography>
            </Box>
            {trend !== undefined && (
              <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                <TrendingUp
                  sx={{
                    fontSize: 14,
                    color: trend >= 0 ? "success.main" : "error.main",
                  }}
                />
                <Typography
                  variant="caption"
                  color={trend >= 0 ? "success.main" : "error.main"}
                  fontWeight={500}
                >
                  {trend >= 0 ? "+" : ""}
                  {trend}% ce mois
                </Typography>
              </Box>
            )}
          </Box>
          {icon && (
            <Avatar
              sx={{
                bgcolor: "#f3f4f6",
                width: 40,
                height: 40,
                borderRadius: 2,
                flexShrink: 0,
              }}
            >
              {React.cloneElement(icon, {
                sx: { color: "#111827", fontSize: 22 },
              })}
            </Avatar>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
