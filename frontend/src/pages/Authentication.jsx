/* eslint-disable no-unused-vars */
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Stack,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  Paper,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { AuthContext } from "../context/AuthContext";

function Authentication() {
  const navigate = useNavigate();
  const [formState, setFormState] = React.useState(0); // 0 = Sign In, 1 = Sign Up
  const [showPassword, setShowPassword] = React.useState(false);
  const [username, setUserName] = React.useState("");
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [toast, setToast] = React.useState({
    open: false,
    message: "",
    severity: "info", // 'success', 'error', 'warning', 'info'
  });
  
  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const showToast = (message, severity = "info") => {
    setToast({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseToast = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setToast({ ...toast, open: false });
  };

  const handleAuth = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!username || !password) {
      showToast("Please fill in all fields", "warning");
      return;
    }

    if (formState === 1 && !name) {
      showToast("Please enter your full name", "warning");
      return;
    }

    try {
      if (formState === 0) {
        // Sign In
        const result = await handleLogin(username, password);
        console.log(result);
        showToast("Login successful! Welcome back.", "success");
        
        // Navigate to /home after successful login
        setTimeout(() => {
          navigate("/home");
        }, 1000);
      } else if (formState === 1) {
        // Sign Up
        const result = await handleRegister(name, username, password);
        console.log(result);
        showToast("Registration successful! You can now sign in.", "success");
        
        // Switch to sign in form and clear fields
        setTimeout(() => {
          setFormState(0);
          setName("");
          setUserName("");
          setPassword("");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      
      // Handle different error scenarios
      if (err.response) {
        const errorMessage = err.response.data.message || err.response.data.error;
        
        // Check if user already exists
        if (
          errorMessage.toLowerCase().includes("exist") ||
          errorMessage.toLowerCase().includes("already") ||
          err.response.status === 409
        ) {
          showToast("Username already exists. Please choose a different username.", "error");
        } else if (errorMessage.toLowerCase().includes("invalid") || errorMessage.toLowerCase().includes("incorrect")) {
          showToast("Invalid username or password. Please try again.", "error");
        } else {
          showToast(errorMessage, "error");
        }
      } else if (err.request) {
        showToast("Network error. Please check your connection.", "error");
      } else {
        showToast("An unexpected error occurred. Please try again.", "error");
      }
    }
  };

  return (
    <section className="h-screen w-full flex items-center justify-center bg-gray-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          elevation={10}
          sx={{
            p: 4,
            width: 380,
            borderRadius: 4,
            backgroundColor: "#1E1E1E",
            color: "white",
          }}
        >
          {/* Icon */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center mb-4"
          >
            <LockIcon sx={{ fontSize: 50, color: "#f59e0b" }} />
          </motion.div>

          {/* Toggle Buttons */}
          <Stack spacing={2} direction="row" justifyContent="center" mb={3}>
            <Button
              variant={formState === 0 ? "contained" : "outlined"}
              onClick={() => setFormState(0)}
              color="primary"
              sx={{ width: "120px" }}
            >
              Sign In
            </Button>
            <Button
              variant={formState === 1 ? "contained" : "outlined"}
              onClick={() => setFormState(1)}
              color="secondary"
              sx={{ width: "120px" }}
            >
              Sign Up
            </Button>
          </Stack>

          {/* Form */}
          <motion.form
            key={formState}
            initial={{ opacity: 0, x: formState === 0 ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
            onSubmit={handleAuth}
          >
            {/* Full Name - Only for Sign Up */}
            {formState === 1 && (
              <TextField
                fullWidth
                label="Full Name"
                type="text"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{
                  mb: 2,
                  input: { color: "white" },
                  label: { color: "#ccc" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#555" },
                    "&:hover fieldset": { borderColor: "#888" },
                    "&.Mui-focused fieldset": { borderColor: "#00bcd4" },
                  },
                }}
              />
            )}

            {/* Username */}
            <TextField
              fullWidth
              label="Username"
              type="text"
              variant="outlined"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              sx={{
                mb: 2,
                input: { color: "white" },
                label: { color: "#ccc" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#888" },
                  "&.Mui-focused fieldset": { borderColor: "#00bcd4" },
                },
              }}
            />

            {/* Password */}
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                input: { color: "white" },
                label: { color: "#ccc" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#555" },
                  "&:hover fieldset": { borderColor: "#888" },
                  "&.Mui-focused fieldset": { borderColor: "#00bcd4" },
                },
              }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    sx={{ color: "#ccc" }}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />

            {/* Remember me + Forgot password */}
            {formState === 0 && (
              <div className="flex items-center justify-between mt-2">
                <FormControlLabel
                  control={<Checkbox sx={{ color: "#ccc" }} />}
                  label={<span style={{ color: "white" }}>Remember me</span>}
                />
                <Typography
                  variant="body2"
                  sx={{ color: "skyblue", cursor: "pointer" }}
                >
                  Forgot password?
                </Typography>
              </div>
            )}

            {/* Submit Button */}
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="success"
              sx={{
                height: 45,
                mt: 2,
                borderRadius: 2,
                fontWeight: "bold",
              }}
            >
              {formState === 0 ? "Login" : "Register"}
            </Button>
          </motion.form>

          {/* Footer Link */}
          <Typography
            variant="body2"
            sx={{ textAlign: "center", mt: 3, color: "#bbb" }}
          >
            {formState === 0 ? (
              <>
                Don't have an account?{" "}
                <span
                  className="cursor-pointer"
                  style={{ color: "skyblue" }}
                  onClick={() => setFormState(1)}
                >
                  Sign Up
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span
                  className="cursor-pointer"
                  style={{ color: "skyblue" }}
                  onClick={() => setFormState(0)}
                >
                  Sign In
                </span>
              </>
            )}
          </Typography>
        </Paper>
      </motion.div>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </section>
  );
}

export default Authentication;