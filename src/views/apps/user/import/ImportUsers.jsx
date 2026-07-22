"use client";

import React, {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Button,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Alert,
  AlertTitle,
  Avatar,
  List,
  ListItem,
  IconButton,
  LinearProgress,
  TablePagination,
  MenuItem,
  Checkbox,
  ListItemText,
  CircularProgress
} from "@mui/material";

import ExcelJS from "exceljs";

import { useDropzone } from "react-dropzone";

import { toast } from "react-toastify";

import {
  object,
  string,
  minLength,
  array
} from "valibot";

import {
  useForm,
  Controller
} from "react-hook-form";

import {
  valibotResolver
} from "@hookform/resolvers/valibot";

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
  useReactTable
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

const columnHelper =
  createColumnHelper();


const schema = object({
  roles: array(
    string([
      minLength(
        1,
        "Each role must be at least 1 character"
      )
    ]),
    [
      minLength(
        1,
        "At least one role must be selected"
      )
    ]
  )
});


const fuzzyFilter = (
  row,
  columnId,
  value,
  addMeta
) => {

  const itemRank = rankItem(
    row.getValue(columnId),
    value
  );

  addMeta({
    itemRank
  });

  return itemRank.passed;
};


/*
|--------------------------------------------------------------------------
| GET ACTUAL CELL VALUE
|--------------------------------------------------------------------------
*/

const getCellValue = (
  value
) => {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }


  /*
  |--------------------------------------------------------------------------
  | Excel Hyperlink
  |--------------------------------------------------------------------------
  */

  if (
    typeof value === "object" &&
    value.hyperlink
  ) {

    if (
      value.text !== undefined &&
      value.text !== null
    ) {

      return String(
        value.text
      ).trim();

    }


    let hyperlink =
      String(
        value.hyperlink
      ).trim();


    if (
      hyperlink
        .toLowerCase()
        .startsWith("mailto:")
    ) {

      return hyperlink
        .replace(
          /^mailto:/i,
          ""
        )
        .split("?")[0]
        .trim();

    }


    return hyperlink;

  }


  /*
  |--------------------------------------------------------------------------
  | Rich Text
  |--------------------------------------------------------------------------
  */

  if (
    typeof value === "object" &&
    Array.isArray(
      value.richText
    )
  ) {

    return value.richText
      .map(
        item =>
          item.text || ""
      )
      .join("")
      .trim();

  }


  /*
  |--------------------------------------------------------------------------
  | Formula Result
  |--------------------------------------------------------------------------
  */

  if (
    typeof value === "object" &&
    value.result !== undefined
  ) {

    return String(
      value.result ?? ""
    ).trim();

  }


  /*
  |--------------------------------------------------------------------------
  | Normal String / Number
  |--------------------------------------------------------------------------
  */

  return String(
    value
  ).trim();

};


/*
|--------------------------------------------------------------------------
| EMAIL VALUE
|--------------------------------------------------------------------------
*/

const getEmailValue = (
  value
) => {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }


  /*
  |--------------------------------------------------------------------------
  | Excel Hyperlink
  |--------------------------------------------------------------------------
  */

  if (
    typeof value === "object" &&
    value.hyperlink
  ) {

    let email =
      value.text ||
      value.hyperlink ||
      "";


    email =
      String(
        email
      ).trim();


    if (
      email
        .toLowerCase()
        .startsWith("mailto:")
    ) {

      email =
        email
          .replace(
            /^mailto:/i,
            ""
          )
          .split("?")[0];

    }


    return email.trim();

  }


  /*
  |--------------------------------------------------------------------------
  | Rich Text
  |--------------------------------------------------------------------------
  */

  if (
    typeof value === "object" &&
    Array.isArray(
      value.richText
    )
  ) {

    return value.richText
      .map(
        item =>
          item.text || ""
      )
      .join("")
      .trim();

  }


  /*
  |--------------------------------------------------------------------------
  | Formula
  |--------------------------------------------------------------------------
  */

  if (
    typeof value === "object" &&
    value.result !== undefined
  ) {

    return String(
      value.result ?? ""
    ).trim();

  }


  /*
  |--------------------------------------------------------------------------
  | Normal String
  |--------------------------------------------------------------------------
  */

  return String(
    value
  ).trim();

};


/*
|--------------------------------------------------------------------------
| EMAIL VALIDATION
|--------------------------------------------------------------------------
*/

const isValidEmail = (
  email
) => {

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(
    email
  );

};


const ImportUsers = ({
  batch,
  onBack,
  userData
}) => {

  const [data, setData] =
    useState([]);

  const [uploadData, setUploadData] =
    useState([]);

  const [missingHeadersData, setMissingHeaders] =
    useState([]);

  const [fileInput, setFileInput] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [isProgress, setIsProgress] =
    useState(false);

  const [openSuccessDialog, setOpenSuccessDialog] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [roles, setRoles] =
    useState([]);

  const [showError, setShowError] =
    useState("");

  const [userRoles, setUserRoles] =
    useState([]);


  const {
    data: session
  } = useSession();


  const {
    doGet
  } = useApi();


  const token =
    session?.user?.token;


  const {
    control,
    formState: {
      errors
    }
  } = useForm({

    resolver:
      valibotResolver(
        schema
      ),

    defaultValues: {
      roles: []
    }

  });


  /*
  |--------------------------------------------------------------------------
  | CHECK ANY ERROR
  |--------------------------------------------------------------------------
  */

  const hasUploadErrors =
    useMemo(() => {

      return uploadData.some(
        row =>
          Object.keys(
            row?.errors || {}
          ).length > 0
      );

    }, [
      uploadData
    ]);


  /*
  |--------------------------------------------------------------------------
  | VALIDATE REPORTING MANAGER
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | Do NOT use paginated userData here.
  |
  | userData only contains the current page.
  |
  | Instead, search the complete employee list
  | from backend using EmpID.
  |
  |--------------------------------------------------------------------------
  */

  const validateReportingManager =
    async (
      empId
    ) => {

      if (
        !empId?.trim()
      ) {

        return {
          valid: true,
          manager: null
        };

      }


      try {

        const response =
          await doGet(
            `admin/validate-reporting-manager?emp_id=${encodeURIComponent(
              empId.trim()
            )}`
          );


        /*
        |--------------------------------------------------------------------------
        | Expected response
        |--------------------------------------------------------------------------
        |
        | {
        |   valid: true,
        |   manager: {
        |     _id: "...",
        |     first_name: "John",
        |     last_name: "Doe"
        |   }
        | }
        |
        |--------------------------------------------------------------------------
        */


        if (
          response?.valid === true &&
          response?.manager
        ) {

          return {
            valid: true,
            manager:
              response.manager
          };

        }


        return {
          valid: false,
          manager: null
        };

      } catch (error) {

        console.error(
          "Error validating reporting manager:",
          error
        );


        return {
          valid: false,
          manager: null,
          error: true
        };

      }

    };


  /*
  |--------------------------------------------------------------------------
  | DROPZONE
  |--------------------------------------------------------------------------
  */

  const {
    getRootProps,
    getInputProps
  } = useDropzone({

    multiple: false,

    maxSize:
      2 * 1024 * 1024,

    accept: {

      "application/vnd.ms-excel": [
        ".xls"
      ],

      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx"
      ]

    },


    onDrop:
      async (
        acceptedFiles
      ) => {

        if (
          !acceptedFiles?.length
        ) {

          return;

        }


        const selectedFile =
          acceptedFiles[0];


        setFileInput(null);

        setMissingHeaders([]);

        setShowError("");

        setLoading(true);

        setProgress(0);

        setData([]);

        setUploadData([]);


        try {

          /*
          |--------------------------------------------------------------------------
          | READ EXCEL
          |--------------------------------------------------------------------------
          */

          const arrayBuffer =
            await selectedFile
              .arrayBuffer();


          const workbook =
            new ExcelJS.Workbook();


          await workbook.xlsx.load(
            arrayBuffer
          );


          const worksheet =
            workbook
              .worksheets[0];


          if (
            !worksheet
          ) {

            throw new Error(
              "Excel file is empty."
            );

          }


          /*
          |--------------------------------------------------------------------------
          | REQUIRED HEADERS
          |--------------------------------------------------------------------------
          */

          const requiredHeaders = [

            "SRNO",

            "Email",

            "FirstName",

            "LastName",

            "PhoneNo",

            "Password",

            "ParticipationType",

            "EmpID",

            "Status"

          ];


          /*
          |--------------------------------------------------------------------------
          | GET HEADERS
          |--------------------------------------------------------------------------
          */

          const headers =
            worksheet
              .getRow(1)
              .values
              .slice(1)
              .map(
                header =>
                  String(
                    header || ""
                  ).trim()
              );


          /*
          |--------------------------------------------------------------------------
          | MISSING HEADERS
          |--------------------------------------------------------------------------
          */

          const missingHeadersList =
            requiredHeaders.filter(
              header =>
                !headers.includes(
                  header
                )
            );


          if (
            missingHeadersList.length >
            0
          ) {

            setMissingHeaders(
              missingHeadersList
            );

            setLoading(false);

            return;

          }


          /*
          |--------------------------------------------------------------------------
          | EXCEL TO JSON
          |--------------------------------------------------------------------------
          */

          const jsonData = [];


          worksheet.eachRow(
            {
              includeEmpty: false
            },

            (
              row,
              rowNumber
            ) => {

              if (
                rowNumber === 1
              ) {

                return;

              }


              const rowValues =
                row.values
                  .slice(1);


              const rowData = {

                excelRowNumber:
                  rowNumber,

                errors: {}

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


          /*
          |--------------------------------------------------------------------------
          | REQUIRED FIELD VALIDATION
          |--------------------------------------------------------------------------
          */

          jsonData.forEach(
            row => {

              requiredHeaders.forEach(
                header => {

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

                    row.errors[header] =
                      `Missing value in "${header}"`;

                  }

                }
              );

            }
          );


          /*
          |--------------------------------------------------------------------------
          | EMAIL VALIDATION
          |--------------------------------------------------------------------------
          */

          jsonData.forEach(
            row => {

              const email =
                getEmailValue(
                  row?.Email
                );


              if (
                !email
              ) {

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


          /*
          |--------------------------------------------------------------------------
          | DUPLICATE EMAIL VALIDATION
          |--------------------------------------------------------------------------
          */

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


              if (
                !email
              ) {

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
                  index => {

                    jsonData[index]
                      .errors.Email =
                      `Duplicate email "${email}" found in Excel`;

                  }
                );

              }

            }
          );


          /*
          |--------------------------------------------------------------------------
          | REPORTING MANAGER VALIDATION
          |--------------------------------------------------------------------------
          |
          | IMPORTANT:
          |
          | userData is PAGINATED.
          |
          | Therefore, DO NOT do:
          |
          | userData.find(...)
          |
          | Instead:
          |
          | API -> find manager by emp_id
          |
          |--------------------------------------------------------------------------
          */

          for (
            const row of jsonData
          ) {

            const reportingManagerEmpId =
              getCellValue(
                row?.ReportingManager
              ).trim();


            /*
            |--------------------------------------------------------------------------
            | EMPTY REPORTING MANAGER
            |--------------------------------------------------------------------------
            |
            | Empty is allowed.
            |
            |--------------------------------------------------------------------------
            */

            if (
              !reportingManagerEmpId
            ) {

              delete row
                .errors
                .ReportingManager;


              row.reporting_manager_id =
                null;


              row.reporting_manager_name =
                "";


              continue;

            }


            /*
            |--------------------------------------------------------------------------
            | FIND MANAGER FROM BACKEND
            |--------------------------------------------------------------------------
            */

            const managerResponse =
              await validateReportingManager(
                reportingManagerEmpId
              );


            /*
            |--------------------------------------------------------------------------
            | MANAGER NOT FOUND
            |--------------------------------------------------------------------------
            */

            if (
              !managerResponse.valid
            ) {

              row.errors.ReportingManager =
                `Reporting Manager EmpID "${reportingManagerEmpId}" does not exist`;


              row.reporting_manager_id =
                null;


              row.reporting_manager_name =
                "";


              continue;

            }


            /*
            |--------------------------------------------------------------------------
            | MANAGER FOUND
            |--------------------------------------------------------------------------
            */

            const manager =
              managerResponse.manager;


            delete row
              .errors
              .ReportingManager;


            row.reporting_manager_id =
              manager?._id ||
              null;


            row.reporting_manager_name =
              [
                manager?.first_name,
                manager?.last_name
              ]
                .filter(Boolean)
                .join(" ");

          }


          /*
          |--------------------------------------------------------------------------
          | SET DATA
          |--------------------------------------------------------------------------
          */

          setUploadData(
            jsonData
          );

          setData(
            jsonData
          );

          setFileInput(
            selectedFile
          );

          setProgress(100);

          setLoading(false);


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

          setUploadData([]);

          setData([]);

          setFileInput(null);

        }

      },


    onDropRejected:
      rejectedFiles => {

        setLoading(false);

        setProgress(0);

        setUploadData([]);

        setData([]);

        setFileInput(null);


        rejectedFiles.forEach(
          file => {

            file.errors.forEach(
              error => {

                let msg = "";


                switch (
                error.code
                ) {

                  case "file-invalid-type":

                    msg =
                      `Invalid file type for ${file.file.name}.`;

                    break;


                  case "file-too-large":

                    msg =
                      `File ${file.file.name} is too large. Maximum size is 2 MB.`;

                    break;


                  case "too-many-files":

                    msg =
                      "Too many files selected.";

                    break;


                  default:

                    msg =
                      `Error with file ${file.file.name}.`;

                }


                toast.error(
                  msg
                );

              }
            );

          }
        );

      }

  });


  /*
  |--------------------------------------------------------------------------
  | GET ROLES
  |--------------------------------------------------------------------------
  */

  const getRoles =
    async () => {

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


  useEffect(
    () => {

      getRoles();

    },
    []
  );


  /*
  |--------------------------------------------------------------------------
  | REMOVE FILE
  |--------------------------------------------------------------------------
  */

  const handleRemoveFile =
    () => {

      setData([]);

      setFileInput(null);

      setUploadData([]);

      setLoading(false);

      setProgress(0);

      setShowError("");

      setMissingHeaders([]);

    };


  /*
  |--------------------------------------------------------------------------
  | START IMPORT
  |--------------------------------------------------------------------------
  */

  const handleUploadData =
    async () => {

      try {

        /*
        |--------------------------------------------------------------------------
        | DO NOT IMPORT IF ERRORS EXIST
        |--------------------------------------------------------------------------
        */

        if (
          hasUploadErrors
        ) {

          setShowError(
            "Please fix all errors before starting the import."
          );

          return;

        }


        /*
        |--------------------------------------------------------------------------
        | ROLE REQUIRED
        |--------------------------------------------------------------------------
        */

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


        const totalChunks =
          Math.ceil(
            uploadData.length /
            CHUNK_SIZE
          );


        const final_url =
          `${process.env.NEXT_PUBLIC_API_URL}/admin/users/import`;


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


          const res =
            await fetch(
              final_url,
              {

                method:
                  "POST",

                headers: {

                  "Content-Type":
                    "application/json",

                  Authorization:
                    `Bearer ${token}`

                },

                body:
                  JSON.stringify({

                    chunk,

                    roles:
                      userRoles

                  })

              }
            );


          const result =
            await res.json();


          if (
            !res.ok
          ) {

            throw new Error(
              result?.message ||
              "Import failed"
            );

          }


          const percent =
            Math.round(
              (
                (i + 1) /
                totalChunks
              ) *
              100
            );


          setProgress(
            percent
          );


          if (
            percent === 100
          ) {

            setOpenSuccessDialog(
              true
            );

            setUploadData([]);

            setUserRoles([]);

            setIsProgress(false);

          }

        }


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

      }

    };


  /*
  |--------------------------------------------------------------------------
  | VALUE + ERROR COMPONENT
  |--------------------------------------------------------------------------
  */

  const FieldValueWithError = ({
    value,
    error
  }) => {

    return (

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          minWidth: "150px"
        }}
      >

        <Typography
          variant="body2"
          sx={{
            color: "text.primary"
          }}
        >

          {
            value !== undefined &&
              value !== null &&
              String(value).trim() !== ""
              ? String(value)
              : "-"
          }

        </Typography>


        {
          error && (

            <Typography
              variant="caption"
              sx={{
                color: "#d32f2f !important",
                mt: 0.5,
                display: "block",
                fontWeight: 500,
                lineHeight: 1.4,
                whiteSpace: "normal"
              }}
            >

              {error}

            </Typography>

          )
        }

      </div>

    );

  };


  /*
  |--------------------------------------------------------------------------
  | TABLE COLUMNS
  |--------------------------------------------------------------------------
  */

  const columns =
    useMemo(
      () => [

        {
          id:
            "serialNumber",

          header:
            "S.No.",

          cell:
            ({
              row
            }) => (

              <FieldValueWithError

                value={
                  row.original?.SRNO
                }

                error={
                  row.original
                    ?.errors
                    ?.SRNO
                }

              />

            )

        },


        columnHelper.accessor(
          "Import Status",
          {

            header:
              "Imported",

            cell:
              ({
                row
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

              }

          }
        ),


        columnHelper.accessor(
          "FirstName",
          {

            header:
              "First Name",

            cell:
              ({
                row
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

              )

          }
        ),


        columnHelper.accessor(
          "LastName",
          {

            header:
              "Last Name",

            cell:
              ({
                row
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

              )

          }
        ),


        columnHelper.accessor(
          "Email",
          {

            header:
              "Email",

            cell:
              ({
                row
              }) => (

                <FieldValueWithError

                  value={
                    getEmailValue(
                      row.original
                        ?.Email
                    )
                  }

                  error={
                    row.original
                      ?.errors
                      ?.Email
                  }

                />

              )

          }
        ),


        columnHelper.accessor(
          "PhoneNo",
          {

            header:
              "Phone",

            cell:
              ({
                row
              }) => (

                <FieldValueWithError

                  value={
                    row.original
                      ?.PhoneNo
                  }

                  error={
                    row.original
                      ?.errors
                      ?.PhoneNo
                  }

                />

              )

          }
        ),


        columnHelper.accessor(
          "ReportingManager",
          {

            header:
              "Reporting Manager",

            cell:
              ({
                row
              }) => (

                <FieldValueWithError

                  value={
                    getCellValue(
                      row.original
                        ?.ReportingManager
                    )
                  }

                  error={
                    row.original
                      ?.errors
                      ?.ReportingManager
                  }

                />

              )

          }
        ),


        columnHelper.accessor(
          "EmpID",
          {

            header:
              "Emp ID",

            cell:
              ({
                row
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

              )

          }
        ),


        columnHelper.accessor(
          "Country",
          {

            header:
              "Country",

            cell:
              ({
                row
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

              )

          }
        ),


        columnHelper.accessor(
          "State",
          {

            header:
              "State",

            cell:
              ({
                row
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

              )

          }
        ),


        columnHelper.accessor(
          "City",
          {

            header:
              "City",

            cell:
              ({
                row
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

              )

          }
        ),


        columnHelper.accessor(
          "Designation",
          {

            header:
              "Designation",

            cell:
              ({
                row
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

              )

          }
        ),


        columnHelper.accessor(
          "Department",
          {

            header:
              "Department",

            cell:
              ({
                row
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

              )

          }
        ),


        columnHelper.accessor(
          "ParticipationType",
          {

            header:
              "ParticipationType",

            cell:
              ({
                row
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

              )

          }
        ),


        columnHelper.accessor(
          "EmployeeType",
          {

            header:
              "EmployeeType",

            cell:
              ({
                row
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

              )

          }
        ),


        columnHelper.accessor(
          "Zone",
          {

            header:
              "Zone",

            cell:
              ({
                row
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

              )

          }
        ),


        columnHelper.accessor(
          "Region",
          {

            header:
              "Region",

            cell:
              ({
                row
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

              )

          }
        ),


        columnHelper.accessor(
          "Branch",
          {

            header:
              "Branch",

            cell:
              ({
                row
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

              )

          }
        ),


        columnHelper.accessor(
          "Status",
          {

            header:
              "Status",

            cell:
              ({
                row
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

              )

          }
        )

      ],

      []
    );


  /*
  |--------------------------------------------------------------------------
  | TABLE
  |--------------------------------------------------------------------------
  */

  const table =
    useReactTable({

      data,

      columns,

      filterFns: {

        fuzzy:
          fuzzyFilter

      },

      initialState: {

        pagination: {

          pageSize:
            10

        }

      },

      enableRowSelection:
        true,

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
        getFacetedMinMaxValues()

    });


  /*
  |--------------------------------------------------------------------------
  | TABLE UI
  |--------------------------------------------------------------------------
  */

  const tableItems = (

    <>

      <div
        className="overflow-x-auto"
      >

        <table
          className={
            tableStyles.table
          }
        >

          <thead>

            {
              table
                .getHeaderGroups()
                .map(
                  headerGroup => (

                    <tr
                      key={
                        headerGroup.id
                      }
                    >

                      {
                        headerGroup.headers
                          .map(
                            header => (

                              <th
                                key={
                                  header.id
                                }
                              >

                                {
                                  header.isPlaceholder
                                    ? null
                                    : (

                                      <div

                                        className={classnames({

                                          "flex items-center":
                                            header.column
                                              .getIsSorted(),

                                          "cursor-pointer select-none":
                                            header.column
                                              .getCanSort()

                                        })}

                                        onClick={
                                          header.column
                                            .getToggleSortingHandler()
                                        }

                                      >

                                        {
                                          flexRender(

                                            header.column
                                              .columnDef
                                              .header,

                                            header.getContext()

                                          )
                                        }

                                      </div>

                                    )
                                }

                              </th>

                            )
                          )
                      }

                    </tr>

                  )
                )
            }

          </thead>


          <tbody>

            {
              table
                .getRowModel()
                .rows
                .map(
                  row => (

                    <tr
                      key={
                        row.id
                      }
                    >

                      {
                        row
                          .getVisibleCells()
                          .map(
                            cell => (

                              <td
                                key={
                                  cell.id
                                }
                              >

                                {
                                  flexRender(

                                    cell.column
                                      .columnDef
                                      .cell,

                                    cell.getContext()

                                  )
                                }

                              </td>

                            )
                          )
                      }

                    </tr>

                  )
                )
            }

          </tbody>

        </table>

      </div>


      <TablePagination

        component={() => (

          <TablePaginationComponent
            table={
              table
            }
          />

        )}

        count={
          table
            .getFilteredRowModel()
            .rows.length
        }

        rowsPerPage={
          table
            .getState()
            .pagination
            .pageSize
        }

        page={
          table
            .getState()
            .pagination
            .pageIndex
        }

        onPageChange={
          (
            _,
            page
          ) => {

            table.setPageIndex(
              page
            );

          }
        }

      />

    </>

  );


  /*
  |--------------------------------------------------------------------------
  | RETURN
  |--------------------------------------------------------------------------
  */

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

            >

              Back

            </Button>

          }

        />


        <CardContent>

          {
            !showError && (

              <Alert
                severity="info"
              >

                <div>

                  <strong>
                    Note:
                  </strong>

                  {" "}

                  Only Excel files with{" "}

                  <code>
                    .xls
                  </code>

                  {" "}or{" "}

                  <code>
                    .xlsx
                  </code>

                  {" "}extensions are allowed.

                </div>


                <br />


                <div>

                  <strong>
                    Compulsory fields:
                  </strong>


                  <ul
                    style={{
                      marginTop: 4,
                      paddingLeft: 20
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

            )
          }


          {
            showError && (

              <Alert
                severity="error"
                sx={{
                  mb: 2
                }}
              >

                {showError}

              </Alert>

            )
          }


          {
            missingHeadersData.length >
            0 && (

              <Alert
                severity="error"
                sx={{
                  mt: 2,
                  mb: 2
                }}
              >

                <AlertTitle>
                  Missing Headers
                </AlertTitle>

                {
                  missingHeadersData.join(
                    ", "
                  )
                }

              </Alert>

            )
          }


          <Controller

            name="roles"

            control={control}

            render={({
              field
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
                  errors.roles?.message
                }

                slotProps={{

                  select: {

                    multiple:
                      true,

                    onChange:
                      event => {

                        const value =
                          event.target
                            .value;


                        setUserRoles(
                          value
                        );


                        field.onChange(
                          value
                        );

                      },

                    renderValue:
                      selectedIds => {

                        return roles
                          .filter(
                            role =>
                              selectedIds
                                .includes(
                                  role._id
                                )
                          )
                          .map(
                            role =>
                              role.name
                          )
                          .join(
                            ", "
                          );

                      }

                  }

                }}

              >

                {
                  roles?.map(
                    role => (

                      <MenuItem

                        key={
                          role._id
                        }

                        value={
                          role._id
                        }

                      >

                        <Checkbox

                          checked={
                            userRoles.includes(
                              role._id
                            )
                          }

                        />

                        <ListItemText
                          primary={
                            role.name
                          }
                        />

                      </MenuItem>

                    )
                  )
                }

              </CustomTextField>

            )}

          />

        </CardContent>


        <CardContent>

          <AppReactDropzone>

            <div
              {...getRootProps({
                className:
                  "dropzone"
              })}
            >

              <input
                {...getInputProps()}
              />


              <div
                className="flex items-center flex-col"
              >

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

                  Drop files here or click to upload.

                </Typography>


                <Typography>

                  Allowed *.xls, *.xlsx

                </Typography>


                <Typography>

                  Max 1 file and max size of 2 MB

                </Typography>

              </div>

            </div>


            {
              loading && (

                <div
                  className="flex items-center gap-3 mt-3"
                >

                  <div
                    className="is-full"
                  >

                    <LinearProgress

                      variant="determinate"

                      value={
                        progress
                      }

                    />

                  </div>


                  <Typography>

                    {
                      `${progress}%`
                    }

                  </Typography>

                </div>

              )
            }


            {
              fileInput && (

                <>

                  <List>

                    <ListItem>

                      <div
                        className="file-details"
                      >

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
                      >

                        <i className="tabler-x" />

                      </IconButton>

                    </ListItem>

                  </List>


                  <div
                    className="flex gap-4 mt-4"
                  >

                    <Button

                      variant="contained"

                      color="warning"

                      onClick={
                        handleRemoveFile
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

                        isProgress

                      }

                    >

                      {
                        isProgress
                          ? (

                            <CircularProgress
                              size={24}
                              color="inherit"
                            />

                          )
                          : hasUploadErrors
                            ? "Fix Errors Before Import"
                            : "Start Import"
                      }

                    </Button>

                  </div>

                </>

              )
            }

          </AppReactDropzone>

        </CardContent>


        {
          (
            data.length > 0 ||
            uploadData.length > 0
          ) && (

            <CardContent>

              {tableItems}

            </CardContent>

          )
        }

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
