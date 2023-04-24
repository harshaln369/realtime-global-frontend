import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BasicSelect from "./basicSelect";
import { Button, IconButton, Paper } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

export default function ControlledAccordions({
  note,
  isEdit,
  setIsEdit,
  editVal,
  setEditVal,
  editPriority,
  setEditPriority,
  handleEditSave,
  handleDelete,
}) {
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Paper elevation={1} variant="outlined" sx={{ margin: "1rem 0" }}>
      <Accordion
        expanded={expanded === "panel1"}
        onChange={handleChange("panel1")}
        sx={{ background: "#C0DBEA" }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >
          {isEdit.value && isEdit._id === note._id ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "stretch",
              }}
            >
              <input
                type="text"
                value={editVal}
                onChange={(e) => setEditVal(e.target.value)}
                style={{ margin: "0 1rem" }}
              />

              <BasicSelect
                items={["High", "Medium", "Low"]}
                name="Priority"
                select={editPriority}
                setSelect={setEditPriority}
              />
              <IconButton
                aria-label="delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditSave(note);
                }}
                sx={{ marginLeft: "1rem" }}
              >
                <SaveIcon />
              </IconButton>
            </div>
          ) : (
            <>
              <Typography variant="h6" sx={{ width: "33%", flexShrink: 0 }}>
                {note.note}
              </Typography>
              <Typography variant="p" sx={{ width: "25%", flexShrink: 0 }}>
                {note.priority}
              </Typography>
              <Typography sx={{ color: "text.secondary" }}>
                {`Contributed By: ${[...new Set(note.contributedBy)].join(
                  ", "
                )}`}
              </Typography>
              <IconButton
                aria-label="edit"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEdit({ value: true, _id: note._id });
                  setEditVal(note.note);
                }}
                sx={{ marginLeft: "auto" }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                aria-label="delete"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete({ _id: note._id });
                }}
              >
                <DeleteIcon />
              </IconButton>
            </>
          )}
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="h6" sx={{ fontSize: "1rem" }}>
            History
          </Typography>
          <ul>
            {note.history.map((el) => (
              <li
                key={el.id}
              >{`Note: ${el.note}, ContributedBy: ${el.contributedBy}`}</li>
            ))}
          </ul>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}
