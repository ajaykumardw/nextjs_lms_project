"use client";

import React, { useEffect, useMemo, useState } from "react";

import {
  Button,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Alert,
  AlertTitle,
  Avatar,
  Tooltip,
  List,
  ListItem,
  IconButton,
  LinearProgress,
  TablePagination,
  MenuItem,
  Checkbox,
  ListItemText,
  CircularProgress,
} from "@mui/material";

import ExcelJS from "exceljs";

import { useDropzone } from "react-dropzone";

import { toast } from "react-toastify";

import { object, string, minLength, array } from "valibot";

import { useForm, Controller } from "react-hook-form";

import { valibotResolver } from "@hookform/resolvers/valibot";

import classnames from "classnames";

import { useSession } from "next-auth/react";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { rankItem } from "@tanstack/match-sorter-utils";

import CustomTextField from "@core/components/mui/TextField";

import CustomAvatar from "@core/components/mui/Avatar";

import { useApi } from "../../../../utils/api";

import tableStyles from "@core/styles/table.module.css";

import AppReactDropzone from "@/libs/styles/AppReactDropzone";

import TablePaginationComponent from "@/components/TablePaginationComponent";

import ImportSuccessDialog from "@/components/dialogs/user/import-success-dialog/page";

const CHUNK_SIZE = 1;

const columnHelper = createColumnHelper();

const schema = object({
  roles: array(
    string([
      minLength(1, "Each role must be at least 1 character"),
    ]),
    [minLength(1, "At least one role must be selected")]
  ),
});

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);

  addMeta({
    itemRank,
  });

  return itemRank.passed;
};

const getCellValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object" && value.hyperlink) {
    if (value.text !== undefined && value.text !== null) {
      return String(value.text).trim();
    }

    const hyperlink = String(value.hyperlink).trim();

    if (hyperlink.toLowerCase().startsWith("mailto:")) {
      return hyperlink
        .replace(/^mailto:/i, "")
        .split("?")[0]
        .trim();
    }

    return hyperlink;
  }

  if (
    typeof value === "object" &&
    Array.isArray(value.richText)
  ) {
    return value.richText
      .map((item) => item.text || "")
      .join("")
      .trim();
  }

  if (
    typeof value === "object" &&
    value.result !== undefined
  ) {

    return String(value.result ?? "").trim();
  }

  return String(value).trim();
};

const getEmailValue = (value) => {
  if (value === null || value === undefined) {

    return "";
  }

  if (typeof value === "object" && value.hyperlink) {
    let email = value.text || value.hyperlink || "";

    email = String(email).trim();

    if (email.toLowerCase().startsWith("mailto:")) {
      email = email
        .replace(/^mailto:/i, "")
        .split("?")[0];
    }

    return email.trim();
  }

  if (
    typeof value === "object" &&
    Array.isArray(value.richText)
  ) {

    return value.richText
      .map((item) => item.text || "")
      .join("")
      .trim();
  }

  if (
    typeof value === "object" &&
    value.result !== undefined
  ) {

    return String(value.result ?? "").trim();
  }

  return String(value).trim();
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  const cleanPhone = String(phone || "").trim();

  return /^\d{10}$/.test(cleanPhone);
};

const isValidStatus = (status) => {
  const cleanStatus = String(status || "")
    .trim()
    .toLowerCase();

  return (
    cleanStatus === "active" ||
    cleanStatus === "inactive"
  );
};

const ImportUsers = ({
  batch,
  onBack,
  userData,
}) => {
  const [data, setData] = useState([]);

  const [uploadData, setUploadData] = useState([]);

  const [missingHeadersData, setMissingHeaders] =
    useState([]);

  const [fileInput, setFileInput] = useState(null);

  const [loading, setLoading] = useState(false);

  const [isProgress, setIsProgress] = useState(false);

  const [openSuccessDialog, setOpenSuccessDialog] =
    useState(false);

  const [progress, setProgress] = useState(0);

  const [uploadStage, setUploadStage] =
    useState("");

  const [roles, setRoles] = useState([]);

  const [showError, setShowError] = useState("");

  const [userRoles, setUserRoles] = useState([]);

  const { data: session } = useSession();

  const { doGet } = useApi();

  const token = session?.user?.token;

  const {
    control,
    formState: { errors },
  } = useForm({
    resolver: valibotResolver(schema),
    defaultValues: {
      roles: [],
    },
  });

  const hasUploadErrors = useMemo(() => {

    return uploadData.some(
      (row) =>
        Object.keys(row?.errors || {}).length > 0
    );
  }, [uploadData]);

  // =====================================================
  // VALIDATE REPORTING MANAGER
  // =====================================================

  const validateReportingManager = async (
    reportingManagerId,
    empId,
    email,
    phone
  ) => {
    try {
      const params = new URLSearchParams();

      const cleanReportingManagerId = String(
        reportingManagerId || ""
      ).trim();

      const cleanEmpId = String(
        empId || ""
      ).trim();

      const cleanEmail = String(
        email || ""
      )
        .trim()
        .toLowerCase();

      const cleanPhone = String(
        phone || ""
      ).trim();

      if (cleanReportingManagerId) {
        params.set(
          "reporting_manager_id",
          cleanReportingManagerId
        );
      }

      if (cleanEmpId) {
        params.set(
          "emp_id",
          cleanEmpId
        );
      }

      if (cleanEmail) {
        params.set(
          "email",
          cleanEmail
        );
      }

      if (cleanPhone) {
        params.set(
          "phone",
          cleanPhone
        );
      }

      const queryString = params.toString();

      const url = queryString
        ? `admin/validate-reporting-manager?${queryString}`
        : "admin/validate-reporting-manager";

      const response = await doGet(url);

      return {
        valid:
          response?.valid === true,

        manager:
          response?.manager || null,

        reportingManagerExists:
          response?.reportingManagerExists === true,

        empIdExists:
          response?.empIdExists === true,

        emailExists:
          response?.emailExists === true,

        phoneExists:
          response?.phoneExists === true,

        error: false,

        message:
          response?.message || "",
      };
    } catch (error) {
      console.error(
        "Error validating reporting manager and employee:",
        error
      );

      return {
        valid: false,

        manager: null,

        reportingManagerExists: false,

        empIdExists: false,

        emailExists: false,

        phoneExists: false,

        error: true,

        message:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to validate employee data",
      };
    }
  };

  // =====================================================
  // EXCEL DROPZONE
  // =====================================================

  const {
    getRootProps,
    getInputProps,
  } = useDropzone({
    multiple: false,

    maxSize: 2 * 1024 * 1024,

    accept: {
      "application/vnd.ms-excel": [".xls"],

      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        [".xlsx"],
    },

    onDrop: async (acceptedFiles) => {
      if (!acceptedFiles?.length) {

        return;
      }

      const selectedFile =
        acceptedFiles[0];

      setFileInput(null);

      setMissingHeaders([]);

      setShowError("");

      setLoading(true);

      setProgress(0);

      setUploadStage(
        "Uploading Excel file..."
      );

      setData([]);

      setUploadData([]);

      try {
        // =================================================
        // STEP 1: READ FILE
        // =================================================

        setUploadStage(
          "Reading Excel file..."
        );

        setProgress(10);

        const arrayBuffer =
          await selectedFile.arrayBuffer();

        setProgress(20);

        // =================================================
        // STEP 2: LOAD WORKBOOK
        // =================================================

        setUploadStage(
          "Processing Excel file..."
        );

        const workbook =
          new ExcelJS.Workbook();

        await workbook.xlsx.load(
          arrayBuffer
        );

        setProgress(30);

        const worksheet =
          workbook.worksheets[0];

        if (!worksheet) {
          throw new Error(
            "Excel file is empty."
          );
        }

        // =================================================
        // STEP 3: VALIDATE HEADERS
        // =================================================

        setUploadStage(
          "Validating Excel headers..."
        );

        setProgress(35);

        const requiredHeaders = [
          "SRNO",
          "Email",
          "FirstName",
          "LastName",
          "PhoneNo",
          "Password",
          "ParticipationType",
          "EmpID",
          "Status",
        ];

        const headers = worksheet
          .getRow(1)
          .values
          .slice(1)
          .map((header) =>
            String(
              header || ""
            ).trim()
          );

        const missingHeadersList =
          requiredHeaders.filter(
            (header) =>
              !headers.includes(header)
          );

        if (
          missingHeadersList.length > 0
        ) {
          setMissingHeaders(
            missingHeadersList
          );

          setLoading(false);

          setProgress(0);

          setUploadStage("");

          return;
        }

        // =================================================
        // STEP 4: CONVERT EXCEL TO JSON
        // =================================================

        setUploadStage(
          "Reading Excel rows..."
        );

        setProgress(40);

        const jsonData = [];

        worksheet.eachRow(
          {
            includeEmpty: false,
          },
          (
            row,
            rowNumber
          ) => {
            if (rowNumber === 1) {

              return;
            }

            const rowValues =
              row.values.slice(1);

            const rowData = {
              excelRowNumber:
                rowNumber,

              errors: {},
            };

            headers.forEach(
              (
                header,
                index
              ) => {
                rowData[header] =
                  rowValues[index] ??
                  "";
              }
            );

            jsonData.push(
              rowData
            );
          }
        );

        // =================================================
        // STEP 5: REQUIRED FIELD VALIDATION
        // =================================================

        setUploadStage(
          "Validating required fields..."
        );

        setProgress(45);

        jsonData.forEach(
          (row) => {
            requiredHeaders.forEach(
              (header) => {
                let value;

                if (
                  header === "Email"
                ) {
                  value =
                    getEmailValue(
                      row[header]
                    );
                } else {
                  value =
                    getCellValue(
                      row[header]
                    );
                }

                if (
                  String(
                    value || ""
                  ).trim() === ""
                ) {
                  row.errors[
                    header
                  ] =
                    `Missing value in "${header}"`;
                }
              }
            );
          }
        );

        // =================================================
        // STEP 6: EMAIL VALIDATION
        // =================================================

        setUploadStage(
          "Validating email addresses..."
        );

        setProgress(48);

        jsonData.forEach(
          (row) => {
            const email =
              getEmailValue(
                row?.Email
              ).trim();

            if (!email) {

              return;
            }

            if (
              !isValidEmail(
                email
              )
            ) {
              row.errors.Email =
                "Please enter a valid email address";
            }
          }
        );

        // =================================================
        // STEP 7: PHONE VALIDATION
        // =================================================

        setUploadStage(
          "Validating phone numbers..."
        );

        setProgress(50);

        jsonData.forEach(
          (row) => {
            const phone =
              getCellValue(
                row?.PhoneNo
              ).trim();

            if (!phone) {

              return;
            }

            if (
              !isValidPhone(
                phone
              )
            ) {
              row.errors.PhoneNo =
                "Phone number must contain exactly 10 digits";
            }
          }
        );

        // =================================================
        // STEP 8: STATUS VALIDATION
        // =================================================

        setUploadStage(
          "Validating user status..."
        );

        setProgress(52);

        jsonData.forEach(
          (row) => {
            const status =
              getCellValue(
                row?.Status
              ).trim();

            if (!status) {

              return;
            }

            if (
              !isValidStatus(
                status
              )
            ) {
              row.errors.Status =
                'Status must be either "Active" or "Inactive"';
            }
          }
        );

        // =================================================
        // STEP 9: DUPLICATE EMAIL CHECK
        // =================================================

        setUploadStage(
          "Checking duplicate email addresses..."
        );

        setProgress(55);

        const emailRows =
          new Map();

        jsonData.forEach(
          (
            row,
            index
          ) => {
            const email =
              getEmailValue(
                row?.Email
              )
                .trim()
                .toLowerCase();

            if (!email) {

              return;
            }

            if (
              !emailRows.has(
                email
              )
            ) {
              emailRows.set(
                email,
                []
              );
            }

            emailRows
              .get(email)
              .push(index);
          }
        );

        emailRows.forEach(
          (
            rowIndexes,
            email
          ) => {
            if (
              rowIndexes.length >
              1
            ) {
              rowIndexes.forEach(
                (index) => {
                  jsonData[
                    index
                  ].errors.Email =
                    `Duplicate email "${email}" found in Excel`;
                }
              );
            }
          }
        );

        // =================================================
        // STEP 10: DUPLICATE PHONE CHECK
        // =================================================

        setUploadStage(
          "Checking duplicate phone numbers..."
        );

        setProgress(60);

        const phoneRows =
          new Map();

        jsonData.forEach(
          (
            row,
            index
          ) => {
            const phone =
              getCellValue(
                row?.PhoneNo
              ).trim();

            if (!phone) {

              return;
            }

            if (
              !phoneRows.has(
                phone
              )
            ) {
              phoneRows.set(
                phone,
                []
              );
            }

            phoneRows
              .get(phone)
              .push(index);
          }
        );

        phoneRows.forEach(
          (
            rowIndexes,
            phone
          ) => {
            if (
              rowIndexes.length >
              1
            ) {
              rowIndexes.forEach(
                (index) => {
                  jsonData[
                    index
                  ].errors.PhoneNo =
                    `Duplicate phone "${phone}" found in Excel`;
                }
              );
            }
          }
        );

        // =================================================
        // STEP 11: BACKEND VALIDATION
        // =================================================

        setUploadStage(
          "Checking Employee ID, Email, Phone and Reporting Manager..."
        );

        setProgress(65);

        const validationResults =
          [];

        const totalRows =
          jsonData.length;

        for (
          let i = 0;
          i < totalRows;
          i++
        ) {
          const row =
            jsonData[i];

          const reportingManagerEmpId =
            getCellValue(
              row?.ReportingManager
            ).trim();

          const empId =
            getCellValue(
              row?.EmpID
            ).trim();

          const email =
            getEmailValue(
              row?.Email
            )
              .trim()
              .toLowerCase();

          const phone =
            getCellValue(
              row?.PhoneNo
            ).trim();

          const response =
            await validateReportingManager(
              reportingManagerEmpId,
              empId,
              email,
              phone
            );

          validationResults.push(
            {
              row,
              response,
              reportingManagerEmpId,
              empId,
              email,
              phone,
            }
          );

          // Progress from 65% to 95%
          const validationProgress =
            totalRows > 0
              ? 65 +
                Math.round(
                  ((i + 1) /
                    totalRows) *
                    30
                )
              : 95;

          setProgress(
            validationProgress
          );

          setUploadStage(
            `Validating row ${i + 1} of ${totalRows}...`
          );
        }

        // =================================================
        // STEP 12: APPLY VALIDATION RESULTS
        // =================================================

        setUploadStage(
          "Finalizing Excel validation..."
        );

        setProgress(98);

        validationResults.forEach(
          ({
            row,
            response,
            reportingManagerEmpId,
            empId,
            email,
            phone,
          }) => {
            // -----------------------------------------
            // Reporting Manager Validation
            // -----------------------------------------

            if (
              reportingManagerEmpId
            ) {
              if (
                !response.manager
              ) {
                row.errors.ReportingManager =
                  `Reporting Manager EmpID "${reportingManagerEmpId}" does not exist`;

                row.reporting_manager_id =
                  null;

                row.reporting_manager_name =
                  "";
              } else {
                const manager =
                  response.manager;

                delete row
                  .errors
                  .ReportingManager;

                row.reporting_manager_id =
                  manager._id ||
                  null;

                row.reporting_manager_name =
                  [
                    manager.first_name,
                    manager.last_name,
                  ]
                    .filter(
                      Boolean
                    )
                    .join(" ");
              }
            } else {
              delete row
                .errors
                .ReportingManager;

              row.reporting_manager_id =
                null;

              row.reporting_manager_name =
                "";
            }

            // -----------------------------------------
            // Employee ID Validation
            // -----------------------------------------

            if (
              response.empIdExists
            ) {
              row.errors.EmpID =
                `Employee ID "${empId}" already exists`;
            }

            // -----------------------------------------
            // Email Validation
            // -----------------------------------------

            if (
              response.emailExists
            ) {
              row.errors.Email =
                `Email "${email}" already exists`;
            }

            // -----------------------------------------
            // Phone Validation
            // -----------------------------------------

            if (
              response.phoneExists
            ) {
              row.errors.PhoneNo =
                `Phone "${phone}" already exists`;
            }

            // -----------------------------------------
            // API Error
            // -----------------------------------------

            if (
              response.error
            ) {
              row.errors.ReportingManager =
                response.message ||
                "Unable to validate employee details";
            }
          }
        );

        // =================================================
        // STEP 13: COMPLETE
        // =================================================

        setUploadStage(
          "Excel validation completed successfully."
        );

        setProgress(100);

        setUploadData(
          jsonData
        );

        setData(
          jsonData
        );

        setFileInput(
          selectedFile
        );

        // Give UI time to show 100%
        setTimeout(() => {
          setLoading(false);

          setUploadStage("");
        }, 500);
      } catch (error) {
        console.error(
          "Error processing Excel:",
          error
        );

        toast.error(
          error?.message ||
            "Error in processing the Excel file."
        );

        setLoading(false);

        setProgress(0);

        setUploadStage("");

        setUploadData([]);

        setData([]);

        setFileInput(null);
      }
    },

    onDropRejected: (
      rejectedFiles
    ) => {
      setLoading(false);

      setProgress(0);

      setUploadStage("");

      setUploadData([]);

      setData([]);

      setFileInput(null);

      rejectedFiles.forEach(
        (file) => {
          file.errors.forEach(
            (error) => {
              let msg = "";

              switch (
                error.code
              ) {
                case "file-invalid-type":
                  msg = `Invalid file type for ${file.file.name}.`;
                  break;

                case "file-too-large":
                  msg = `File ${file.file.name} is too large. Maximum size is 2 MB.`;
                  break;

                case "too-many-files":
                  msg =
                    "Too many files selected.";
                  break;

                default:
                  msg = `Error with file ${file.file.name}.`;
              }

              toast.error(
                msg
              );
            }
          );
        }
      );
    },
  });

  // =====================================================
  // GET ROLES
  // =====================================================

  const getRoles = async () => {
    try {
      const roleData =
        await doGet(
          "company/role"
        );

      setRoles(
        roleData
      );
    } catch (error) {
      console.error(
        "Error fetching roles:",
        error
      );
    }
  };

  useEffect(() => {
    getRoles();
  }, []);

  // =====================================================
  // REMOVE FILE
  // =====================================================

  const handleRemoveFile = () => {
    setData([]);

    setFileInput(null);

    setUploadData([]);

    setLoading(false);

    setProgress(0);

    setUploadStage("");

    setShowError("");

    setMissingHeaders([]);
  };

  // =====================================================
  // IMPORT DATA
  // =====================================================

  const handleUploadData =
    async () => {
      try {
        if (hasUploadErrors) {
          setShowError(
            "Please fix all errors before starting the import."
          );

          return;
        }

        if (
          userRoles.length === 0
        ) {
          setShowError(
            "Please choose the role first"
          );

          return;
        }

        setShowError("");

        setIsProgress(true);

        setProgress(0);

        setUploadStage(
          "Preparing users for import..."
        );

        const totalChunks =
          Math.ceil(
            uploadData.length /
              CHUNK_SIZE
          );

        const final_url = `${process.env.NEXT_PUBLIC_API_URL}/admin/users/import`;

        for (
          let i = 0;
          i < totalChunks;
          i++
        ) {
          const chunk =
            uploadData.slice(
              i * CHUNK_SIZE,
              (i + 1) *
                CHUNK_SIZE
            );

          setUploadStage(
            `Importing users ${i + 1} of ${totalChunks}...`
          );

          const res =
            await fetch(
              final_url,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",

                  Authorization: `Bearer ${token}`,
                },

                body: JSON.stringify(
                  {
                    chunk,

                    roles: userRoles,
                  }
                ),
              }
            );

          const result =
            await res.json();

          if (!res.ok) {
            throw new Error(
              result?.message ||
                "Import failed"
            );
          }

          const percent =
            Math.round(
              ((i + 1) /
                totalChunks) *
                100
            );

          setProgress(
            percent
          );
        }

        // =================================================
        // IMPORT COMPLETE
        // =================================================

        setUploadStage(
          "Import completed successfully!"
        );

        setProgress(100);

        setTimeout(() => {
          setOpenSuccessDialog(
            true
          );

          setUploadData([]);

          setUserRoles([]);

          setIsProgress(false);

          setUploadStage("");
        }, 500);
      } catch (error) {
        console.error(
          "Import error:",
          error
        );

        toast.error(
          error?.message ||
            "Error in processing the Excel file."
        );

        setIsProgress(false);

        setUploadStage("");

        setProgress(0);
      }
    };

  // =====================================================
  // FIELD VALUE WITH ERROR
  // =====================================================

  const FieldValueWithError = ({
    value,
    error,
  }) => {
    
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          minWidth: "150px",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "text.primary",
          }}
        >
          {value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
            ? String(value)
            : "-"}
        </Typography>

        {error && (
          <Typography
            variant="caption"
            sx={{
              color:
                "#d32f2f !important",
              mt: 0.5,
              display: "block",
              fontWeight: 500,
              lineHeight: 1.4,
              whiteSpace:
                "normal",
            }}
          >
            {error}
          </Typography>
        )}
      </div>
    );
  };

  // =====================================================
  // TABLE COLUMNS
  // =====================================================

  const columns = useMemo(
    () => [
      {
        id: "serialNumber",

        header: "S.No.",

        cell: ({
          row,
        }) => (
          <FieldValueWithError
            value={
              row.original
                ?.SRNO
            }
            error={
              row.original
                ?.errors
                ?.SRNO
            }
          />
        ),
      },

      columnHelper.accessor(
        "Import Status",
        {
          header:
            "Imported",

          cell: ({
            row,
          }) => {
            const hasErrors =
              Object.keys(
                row.original
                  ?.errors ||
                  {}
              ).length > 0;

            return (
              <CustomAvatar
                skin="light"
                color={
                  hasErrors
                    ? "error"
                    : "success"
                }
              >
                <i
                  className={
                    hasErrors
                      ? "tabler-circle-x"
                      : "tabler-circle-check"
                  }
                />
              </CustomAvatar>
            );
          },
        }
      ),

      columnHelper.accessor(
        "FirstName",
        {
          header:
            "First Name",

          cell: ({
            row,
          }) => (
            <FieldValueWithError
              value={
                row.original
                  ?.FirstName
              }
              error={
                row.original
                  ?.errors
                  ?.FirstName
              }
            />
          ),
        }
      ),

      columnHelper.accessor(
        "LastName",
        {
          header:
            "Last Name",

          cell: ({
            row,
          }) => (
            <FieldValueWithError
              value={
                row.original
                  ?.LastName
              }
              error={
                row.original
                  ?.errors
                  ?.LastName
              }
            />
          ),
        }
      ),

      columnHelper.accessor(
        "Email",
        {
          header:
            "Email",

          cell: ({
            row,
          }) => (
            <FieldValueWithError
              value={getEmailValue(
                row.original
                  ?.Email
              )}
              error={
                row.original
                  ?.errors
                  ?.Email
              }
            />
          ),
        }
      ),

      columnHelper.accessor(
        "PhoneNo",
        {
          header:
            "Phone",

          cell: ({
            row,
          }) => (
            <FieldValueWithError
              value={getCellValue(
                row.original
                  ?.PhoneNo
              )}
              error={
                row.original
                  ?.errors
                  ?.PhoneNo
              }
            />
          ),
        }
      ),

      columnHelper.accessor(
        "ReportingManager",
        {
          header: () => (
            <Tooltip title="Please enter Employee ID in Reporting Manager">
              <span>
                Reporting Manager
              </span>
            </Tooltip>
          ),

          cell: ({
            row,
          }) => (
            <FieldValueWithError
              value={getCellValue(
                row.original
                  ?.ReportingManager
              )}
              error={
                row.original
                  ?.errors
                  ?.ReportingManager
              }
            />
          ),
        }
      ),

      columnHelper.accessor(
        "EmpID",
        {
          header:
            "Emp ID",

          cell: ({
            row,
          }) => (
            <FieldValueWithError
              value={
                row.original
                  ?.EmpID
              }
              error={
                row.original
                  ?.errors
                  ?.EmpID
              }
            />
          ),
        }
      ),

      columnHelper.accessor(
        "Country",
        {
          header:
            "Country",

          cell: ({
            row,
          }) => (
            <FieldValueWithError
              value={
                row.original
                  ?.Country
              }
              error={
                row.original
                  ?.errors
                  ?.Country
              }
            />
          ),
        }
      ),

      columnHelper.accessor(
        "State",
        {
          header:
            "State",

          cell: ({
            row,
          }) => (
            <FieldValueWithError
              value={
                row.original
                  ?.State
              }
              error={
                row.original
                  ?.errors
                  ?.State
              }
            />
          ),
        }
      ),

      columnHelper.accessor(
        "City",
        {
          header:
            "City",

          cell: ({
            row,
          }) => (
            <FieldValueWithError
              value={
                row.original
                  ?.City
              }
              error={
                row.original
                  ?.errors
                  ?.City
              }
            />
          ),
        }
      ),

      columnHelper.accessor(
        "Designation",
        {
          header:
            "Designation",

          cell: ({
            row,
          }) => (
            <FieldValueWithError
              value={
                row.original
                  ?.Designation
              }
              error={
                row.original
                  ?.errors
                  ?.Designation
              }
            />
          ),
        }
      ),

      columnHelper.accessor(
        "Department",
        {
          header:
            "Department",

          cell: ({
            row,
          }) => (
            <FieldValueWithError
              value={
                row.original
                  ?.Department
              }
              error={
                row.original
                  ?.errors
                  ?.Department
              }
            />
          ),
        }
      ),

      columnHelper.accessor(
        "ParticipationType",
        {
          header:
            "ParticipationType",

          cell: ({
            row,
          }) => (
            <FieldValueWithError
              value={
                row.original
                  ?.ParticipationType
              }
              error={
                row.original
                  ?.errors
                  ?.ParticipationType
              }
            />
          ),
        }
      ),

      columnHelper.accessor(
        "EmployeeType",
        {
          header:
            "EmployeeType",

          cell: ({
            row,
          }) => (
            <FieldValueWithError
              value={
                row.original
                  ?.EmployeeType
              }
              error={
                row.original
                  ?.errors
                  ?.EmployeeType
              }
            />
          ),
        }
      ),

      columnHelper.accessor(
        "Zone",
        {
          header:
            "Zone",

          cell: ({
            row,
          }) => (
            <FieldValueWithError
              value={
                row.original
                  ?.Zone
              }
              error={
                row.original
                  ?.errors
                  ?.Zone
              }
            />
          ),
        }
      ),

      columnHelper.accessor(
        "Region",
        {
          header:
            "Region",

          cell: ({
            row,
          }) => (
            <FieldValueWithError
              value={
                row.original
                  ?.Region
              }
              error={
                row.original
                  ?.errors
                  ?.Region
              }
            />
          ),
        }
      ),

      columnHelper.accessor(
        "Branch",
        {
          header:
            "Branch",

          cell: ({
            row,
          }) => (
            <FieldValueWithError
              value={
                row.original
                  ?.Branch
              }
              error={
                row.original
                  ?.errors
                  ?.Branch
              }
            />
          ),
        }
      ),

      columnHelper.accessor(
        "Status",
        {
          header:
            "Status",

          cell: ({
            row,
          }) => (
            <FieldValueWithError
              value={
                row.original
                  ?.Status
              }
              error={
                row.original
                  ?.errors
                  ?.Status
              }
            />
          ),
        }
      ),
    ],
    []
  );

  // =====================================================
  // TABLE
  // =====================================================

  const table =
    useReactTable({
      data,

      columns,

      filterFns: {
        fuzzy: fuzzyFilter,
      },

      initialState: {
        pagination: {
          pageSize: 10,
        },
      },

      enableRowSelection: true,

      globalFilterFn:
        fuzzyFilter,

      getCoreRowModel:
        getCoreRowModel(),

      getFilteredRowModel:
        getFilteredRowModel(),

      getSortedRowModel:
        getSortedRowModel(),

      getPaginationRowModel:
        getPaginationRowModel(),

      getFacetedRowModel:
        getFacetedRowModel(),

      getFacetedUniqueValues:
        getFacetedUniqueValues(),

      getFacetedMinMaxValues:
        getFacetedMinMaxValues(),
    });

  // =====================================================
  // TABLE ITEMS
  // =====================================================

  const tableItems = (
    <>
      <div className="overflow-x-auto">
        <table
          className={
            tableStyles.table
          }
        >
          <thead>
            {table
              .getHeaderGroups()
              .map(
                (
                  headerGroup
                ) => (
                  <tr
                    key={
                      headerGroup.id
                    }
                  >
                    {headerGroup.headers.map(
                      (
                        header
                      ) => (
                        <th
                          key={
                            header.id
                          }
                        >
                          {header.isPlaceholder
                            ? null
                            : (
                              <div
                                className={classnames(
                                  {
                                    "flex items-center":
                                      header.column.getIsSorted(),

                                    "cursor-pointer select-none":
                                      header.column.getCanSort(),
                                  }
                                )}
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {flexRender(
                                  header
                                    .column
                                    .columnDef
                                    .header,

                                  header.getContext()
                                )}
                              </div>
                            )}
                        </th>
                      )
                    )}
                  </tr>
                )
              )}
          </thead>

          <tbody>
            {table
              .getRowModel()
              .rows.map(
                (row) => (
                  <tr
                    key={
                      row.id
                    }
                  >
                    {row
                      .getVisibleCells()
                      .map(
                        (
                          cell
                        ) => (
                          <td
                            key={
                              cell.id
                            }
                          >
                            {flexRender(
                              cell
                                .column
                                .columnDef
                                .cell,

                              cell.getContext()
                            )}
                          </td>
                        )
                      )}
                  </tr>
                )
              )}
          </tbody>
        </table>
      </div>

      <TablePagination
        component={() => (
          <TablePaginationComponent
            table={table}
          />
        )}
        count={
          table
            .getFilteredRowModel()
            .rows.length
        }
        rowsPerPage={
          table.getState()
            .pagination
            .pageSize
        }
        page={
          table.getState()
            .pagination
            .pageIndex
        }
        onPageChange={(
          _,
          page
        ) => {
          table.setPageIndex(
            page
          );
        }}
      />
    </>
  );

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      <Card>
        <CardHeader
          title="Import Users"
          action={
            <Button
              onClick={
                onBack
              }
              variant="outlined"
              color="primary"
              size="small"
              disabled={
                loading ||
                isProgress
              }
            >
              Back
            </Button>
          }
        />

        <CardContent>
          {!showError && (
            <Alert severity="info">
              <div>
                <strong>
                  Note:
                </strong>{" "}
                Only Excel
                files with{" "}
                <code>
                  .xls
                </code>{" "}
                or{" "}
                <code>
                  .xlsx
                </code>{" "}
                extensions are
                allowed.
              </div>

              <br />

              <div>
                <strong>
                  Compulsory fields:
                </strong>

                <ul
                  style={{
                    marginTop: 4,
                    paddingLeft: 20,
                  }}
                >
                  <li>
                    SRNO
                  </li>

                  <li>
                    First Name
                  </li>

                  <li>
                    Last Name
                  </li>

                  <li>
                    Email
                  </li>

                  <li>
                    Password
                  </li>

                  <li>
                    Phone
                  </li>

                  <li>
                    Participation Type
                  </li>

                  <li>
                    Emp ID
                  </li>

                  <li>
                    Status
                  </li>
                </ul>
              </div>
            </Alert>
          )}

          {showError && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
              }}
            >
              {showError}
            </Alert>
          )}

          {missingHeadersData.length >
            0 && (
            <Alert
              severity="error"
              sx={{
                mt: 2,
                mb: 2,
              }}
            >
              <AlertTitle>
                Missing Headers
              </AlertTitle>

              {missingHeadersData.join(
                ", "
              )}
            </Alert>
          )}

          <Button
            component="a"
            href="/sample/users_import.xlsx"
            download="User Sample"
            style={{
              marginTop:
                "14px",
              marginBottom:
                "14px",
            }}
            variant="contained"
            disabled={
              loading ||
              isProgress
            }
          >
            Download Sample XLSX File
          </Button>

          <Controller
            name="roles"
            control={control}
            render={({
              field,
            }) => (
              <CustomTextField
                {...field}
                select
                fullWidth
                label="Assign role*"
                value={
                  userRoles
                }
                error={
                  !!errors.roles
                }
                helperText={
                  errors.roles
                    ?.message
                }
                disabled={
                  loading ||
                  isProgress
                }
                slotProps={{
                  select: {
                    multiple:
                      true,

                    onChange: (
                      event
                    ) => {
                      const value =
                        event
                          .target
                          .value;

                      setUserRoles(
                        value
                      );

                      field.onChange(
                        value
                      );
                    },

                    renderValue: (
                      selectedIds
                    ) => {
                      return roles
                        .filter(
                          (
                            role
                          ) =>
                            selectedIds.includes(
                              role._id
                            )
                        )
                        .map(
                          (
                            role
                          ) =>
                            role.name
                        )
                        .join(
                          ", "
                        );
                    },
                  },
                }}
              >
                {roles?.map(
                  (
                    role
                  ) => (
                    <MenuItem
                      key={
                        role._id
                      }
                      value={
                        role._id
                      }
                    >
                      <Checkbox
                        checked={userRoles.includes(
                          role._id
                        )}
                      />

                      <ListItemText
                        primary={
                          role.name
                        }
                      />
                    </MenuItem>
                  )
                )}
              </CustomTextField>
            )}
          />
        </CardContent>

        <CardContent>
          <AppReactDropzone>
            <div
              {...getRootProps(
                {
                  className:
                    "dropzone",
                }
              )}
              style={{
                pointerEvents:
                  loading ||
                  isProgress
                    ? "none"
                    : "auto",

                opacity:
                  loading ||
                  isProgress
                    ? 0.6
                    : 1,
              }}
            >
              <input
                {...getInputProps()}
              />

              <div className="flex items-center flex-col">
                <Avatar
                  variant="rounded"
                  className="bs-12 is-12 mbe-9"
                >
                  <i className="tabler-upload" />
                </Avatar>

                <Typography
                  variant="h4"
                  className="mbe-2.5"
                >
                  Drop files here or click to
                  upload.
                </Typography>

                <Typography>
                  Allowed *.xls, *.xlsx
                </Typography>

                <Typography>
                  Max 1 file and max size of 2 MB
                </Typography>
              </div>
            </div>

            {/* =========================================
                EXCEL PROCESSING / IMPORT PROGRESS
            ========================================= */}

            {(loading ||
              isProgress) && (
              <div
                style={{
                  marginTop:
                    "20px",
                  padding:
                    "16px",
                  borderRadius:
                    "8px",
                  backgroundColor:
                    "rgba(0, 0, 0, 0.03)",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    marginBottom:
                      "8px",
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={
                      500
                    }
                  >
                    {uploadStage ||
                      "Processing..."}
                  </Typography>

                  <Typography
                    variant="body2"
                    fontWeight={
                      700
                    }
                  >
                    {progress}%
                  </Typography>
                </div>

                <LinearProgress
                  variant="determinate"
                  value={
                    progress
                  }
                  sx={{
                    height:
                      8,
                    borderRadius:
                      4,
                  }}
                />
              </div>
            )}

            {fileInput && (
              <>
                <List>
                  <ListItem>
                    <div className="file-details">
                      <Typography>
                        {
                          fileInput.name
                        }
                      </Typography>
                    </div>

                    <IconButton
                      onClick={
                        handleRemoveFile
                      }
                      disabled={
                        loading ||
                        isProgress
                      }
                    >
                      <i className="tabler-x" />
                    </IconButton>
                  </ListItem>
                </List>

                <div className="flex gap-4 mt-4">
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={
                      handleRemoveFile
                    }
                    disabled={
                      loading ||
                      isProgress
                    }
                  >
                    Remove
                  </Button>

                  <Button
                    variant="contained"
                    onClick={
                      handleUploadData
                    }
                    disabled={
                      uploadData.length ===
                        0 ||
                      hasUploadErrors ||
                      isProgress ||
                      loading
                    }
                  >
                    {isProgress ? (
                      <div className="flex items-center gap-2">
                        <CircularProgress
                          size={
                            24
                          }
                          color="inherit"
                        />

                        <span>
                          Importing...
                        </span>
                      </div>
                    ) : hasUploadErrors ? (
                      "Fix Errors Before Import"
                    ) : (
                      "Start Import"
                    )}
                  </Button>
                </div>
              </>
            )}
          </AppReactDropzone>
        </CardContent>

        {(data.length >
          0 ||
          uploadData.length >
            0) && (
          <CardContent>
            {tableItems}
          </CardContent>
        )}
      </Card>

      <ImportSuccessDialog
        open={
          openSuccessDialog
        }
        setOpen={
          setOpenSuccessDialog
        }
      />
    </>
  );
};

export default ImportUsers;
