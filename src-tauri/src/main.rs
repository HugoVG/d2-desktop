// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(unix)]
use std::os::unix::fs::PermissionsExt;

use std::io::Write;
use std::process::{Command, Stdio};
use tempfile::NamedTempFile;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn execute_d2(input_data: String) -> Result<String, String> {
    println!("Executing D2");
    run_d2(&["-", "-"], input_data).map_err(|err| err.to_string())
}

const D2_EXECUTABLE: &[u8] = include_bytes!("../d2_binaries/d2");

fn main() {
    println!("Arrived to the main function");
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, execute_d2])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn run_d2(args: &[&str], input_data: String) -> Result<String, Box<dyn std::error::Error>> {
    // Create a temporary file
    let mut temp_file = NamedTempFile::new()?;

    // Write the executable content to the temporary file
    temp_file.write_all(D2_EXECUTABLE)?;

    // Get the path of the temporary file
    let executable_path = temp_file.path();

    // Set permissions to make the file executable
    let mut permissions = executable_path.metadata()?.permissions();
    permissions.set_mode(0o755);
    std::fs::set_permissions(&executable_path, permissions)?;

    // Execute the binary with the given arguments and pass the input_data via stdin
    let mut child = Command::new(&executable_path)
        .args(args)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()?;

    // Write the input_data to the binary's stdin
    child
        .stdin
        .as_mut()
        .unwrap()
        .write_all(input_data.as_bytes())?;

    // Wait for the binary to finish processing and collect its output
    let output = child.wait_with_output()?;

    // Check if the command execution was successful
    if output.status.success() {
        // Return the output of the command as a String
        Ok(String::from_utf8_lossy(&output.stdout).into_owned())
    } else {
        // Return an error with the output from stderr
        Err(format!(
            "Command failed with error: {}",
            String::from_utf8_lossy(&output.stderr)
        )
        .into())
    }
}
