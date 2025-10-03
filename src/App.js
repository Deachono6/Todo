import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { th } from "date-fns/locale";
import { StyledTableCell, StyledTableRow } from "./Appstyle";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import api from "./api";

function App() {
  const [todos, setTodos] = useState([]);
  const [name, setName] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [editId, setEditId] = useState(null);

  const fetchTodos = async () => {
    try {
      const response = await api.get("/");
      setTodos(response.data);
    } catch (err) {
      console.error(err);
    }
  };
  const handleAddOrUpdate = async () => {
    if (!name || !dateStart) return;

    if (editId !== null) {
      // อัปเดต state
      setTodos(
        todos.map((todo) =>
          todo._id === editId ? { ...todo, name, date_start: dateStart } : todo
        )
      );

      // อัปเดต server (PUT)
      try {
        await api.put(`/${editId}`, {
          name,
          date_start: dateStart,
        });
      } catch (err) {
        console.error(err);
      }

      setEditId(null);
    } else {
      // สร้าง Todo ใหม่
      const newTodo = {
        id: Date.now(),
        name,
        date_start: dateStart,
        finished: false,
      };

      // อัปเดต state

      // ส่งไป server
      try {
        const response = await api.post("/", newTodo);
        console.log("Todo saved:", response.data);
        setTodos([...todos, response.data]);
      } catch (err) {
        console.error(err);
      }
    }

    setName("");
    setDateStart("");
  };
  const handleEdit = (todo) => {
    setName(todo.name);
    setDateStart(todo.date_start);
    setEditId(todo._id);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/${id}`);
      fetchTodos();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFinished = async (id) => {
    const updatedTodos = todos.map((todo) =>
      todo._id === id ? { ...todo, finished: !todo.finished } : todo
    );
    setTodos(updatedTodos);

    const todoToUpdate = todos.find((t) => t._id === id);
    if (!todoToUpdate) return;

    try {
      await api.put(`/${id}`, {
        ...todoToUpdate,
        finished: !todoToUpdate.finished,
      });
      fetchTodos();
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchTodos();
  }, []);
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} locale={th}>
      <Box>
        <Box
          sx={{
            maxWidth: "1200px",
            overflowX: "auto",
            margin: "0 auto",
            mt: 4,
            mb: 4,
          }}
        >
          <h2>Todo List</h2>
          <Box mb={2} alignItems="center" gap={2} display="flex">
            <TextField
              type="text"
              placeholder="ชื่อรายการ"
              value={name}
              onChange={async (e) => {
                setName(e.target.value);
                try {
                  const res = await api.get("/search", {
                    params: { name: e.target.value },
                  });
                  setTodos(res?.data);
                  
                } catch (err) {
                  console.error(err);
                }
              }}
              style={{ marginRight: 8 }}
              size="small"
            />
            <DatePicker
              label="วันที่เริ่ม"
              value={
                dateStart
                  ? new Date(dateStart.split("/").reverse().join("-"))
                  : null
              }
              format="dd/MM/yyyy"
              slotProps={{ textField: { size: "small" } }}
              onChange={(newValue) => {
                if (newValue) {
                  const formatted = format(newValue, "dd/MM/yyyy");
                  setDateStart(formatted);
                } else {
                  setDateStart("");
                }
              }}
            />

            <Button variant="contained" onClick={handleAddOrUpdate}>
              {" "}
              {editId !== null ? "บันทึก" : "เพิ่ม"}
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ width: "100%" }}>
            <Table sx={{ width: "100%" }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>ชื่อรายการ</StyledTableCell>
                  <StyledTableCell align="right">วันที่เริ่ม</StyledTableCell>
                  <StyledTableCell align="right">เสร็จแล้ว</StyledTableCell>
                  <StyledTableCell align="right">จัดการข้อมูล</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {todos?.map((row) => (
                  <StyledTableRow key={row?.id}>
                    <StyledTableCell component="th" scope="row">
                      {row?.name}
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {row?.date_start}
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <Checkbox
                        checked={row?.finished}
                        size="medium"
                        onChange={() => handleToggleFinished(row._id)}
                      />
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <Box display="flex" gap={1} justifyContent="flex-end">
                        <Button onClick={() => handleEdit(row)}>แก้ไข</Button>
                        <Button
                          color="error"
                          onClick={() => handleDelete(row._id)}
                        >
                          ลบ
                        </Button>
                      </Box>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

export default App;
