import React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Button } from "antd";

function Row(props) {
  const { row, onDelete, rowIndex } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        {props.columns.filter(c => c.label !== "Details" && c.label !== "Status" && c.label !== "Cancel Appointment" && c.label !== "Generate Report").map((col, i) => (
          <TableCell key={i} align={col.align} component={i === 0 ? "th" : "td"} scope={i === 0 ? "row" : ""}>
            {row[col.key] || row[col.label.toLowerCase().replace(" ", "_")] || row[col.label.toLowerCase()]}
          </TableCell>
        ))}
        <TableCell align="right">
          <Button
            type="primary"
            size="large"
            key="Awd"
            danger
            onClick={() => onDelete(rowIndex)}
          >
            {row.buttonText}
          </Button>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Details
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Phone Number</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell align="right">Problem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.details.map((detailsRow) => (
                    <TableRow key={detailsRow.phonenum}>
                      <TableCell component="th" scope="row">
                        {detailsRow.phonenum}
                      </TableCell>
                      <TableCell>{detailsRow.department}</TableCell>
                      <TableCell align="right">{detailsRow.problem}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    buttonText: PropTypes.string.isRequired,
    details: PropTypes.arrayOf(
      PropTypes.shape({
        phonenum: PropTypes.string.isRequired,
        department: PropTypes.string.isRequired,
        problem: PropTypes.string,
        fees: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  rowIndex: PropTypes.number.isRequired,
};

const CollapsibleTable = (props) => {
  const { data, columns, onDelete } = props;

  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            {columns.map((column, index) => (
              <TableCell key={index} align={column.align}>
                {column.label === "Name"
                  ? column.userType === "doctor"
                    ? "Patient Name"
                    : "Doctor Name"
                  : column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <Row row={row} onDelete={onDelete} rowIndex={row.id} columns={columns} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

CollapsibleTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      buttonText: PropTypes.string.isRequired,
      details: PropTypes.arrayOf(
        PropTypes.shape({
          phonenum: PropTypes.string.isRequired,
          department: PropTypes.string.isRequired,
          problem: PropTypes.string,
          fees: PropTypes.number.isRequired,
        })
      ).isRequired,
      onDelete: PropTypes.func.isRequired,
    })
  ).isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      userType: PropTypes.string,
      label: PropTypes.string.isRequired,
      align: PropTypes.oneOf(["left", "center", "right"]),
    })
  ).isRequired,
};

export default CollapsibleTable;
