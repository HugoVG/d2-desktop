// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::error::Error;
#[cfg(unix)]
use std::os::unix::fs::PermissionsExt;

use std::io::Read;
use std::io::Write;
use std::process::{Command, Stdio};
use tempfile::NamedTempFile;

use std::string::String;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn execute_d2(input_data: String, file_name: String) -> Result<String, String> {
    println!("Executing D2");
    let returnstring = run_d2(&["-", "-"], input_data, file_name).map_err(|err| err.to_string());
    println!("returning from execute_d2");
    return returnstring;
}
// Get all files in /inputfiles and return them in a string array
#[tauri::command]
fn get_input_files() -> Result<Vec<String>, String> {
    let mut input_files: Vec<String> = Vec::new();
    for entry in std::fs::read_dir("inputfiles").unwrap() {
        let entry = entry.unwrap();
        let path = entry.path();
        if path.is_file() {
            input_files.push(path.file_name().unwrap().to_str().unwrap().to_string());
        }
    }
    Ok(input_files)
}
#[tauri::command]
fn get_input_file_contents(file_name: String) -> Result<String, String> {
    let mut input_data = String::new();
    let mut file = std::fs::File::open(format!("inputfiles/{}", file_name)).unwrap();
    file.read_to_string(&mut input_data).unwrap();
    println!("input_data: {:?}", input_data);
    Ok(input_data)
}
// Tauri Command to remove a file from the inputfiles directory
#[tauri::command]
fn remove_input_file(file_name: String) -> Result<(), String> {
    std::fs::remove_file(format!("inputfiles/{}", file_name)).unwrap();
    Ok(())
}

#[cfg(unix)]
const D2_EXECUTABLE: &[u8] = include_bytes!("../d2_binaries/d2");
#[cfg(windows)]
const D2_EXECUTABLE: &[u8] = include_bytes!("../d2_binaries/d2.exe");

fn main() {
    println!("Arrived to the main function");
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            execute_d2,
            get_input_files,
            get_input_file_contents,
            remove_input_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn run_d2(
    args: &[&str],
    input_data: String,
    file_name: String,
) -> Result<String, Box<dyn std::error::Error>> {
    // Create a temporary file
    let mut temp_file = NamedTempFile::new()?;

    // Write the executable content to the temporary file
    temp_file.write_all(D2_EXECUTABLE)?;

    println!("wrote to temp file at {:?}", temp_file.path());

    // Get the path of the temporary file
    let executable_path = temp_file.path();
    #[cfg(unix)] // Set the executable permission on Unix systems
    if cfg!(unix) {
        // Set permissions to make the file executable on Unix
        let mut permissions = executable_path.metadata()?.permissions();
        permissions.set_mode(0o755);
        std::fs::set_permissions(&executable_path, permissions)?;
    }
    // Write input_data to ./inputfiles/file_name
    std::fs::write(format!("inputfiles/{}", file_name), input_data.clone())
        .expect("Unable to write file");

    if cfg!(target_os = "windows") {
        if let Some(value) = run_d2_windows(&input_data) {
            return value;
        }
    }

    // Execute the binary with the given arguments and pass the input_data via stdin
    let mut child = Command::new(&executable_path.to_str().unwrap())
        .args(args)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()?;
    println!("spawned child");
    // Write the input_data to the binary's stdin
    child
        .stdin
        .as_mut()
        .unwrap()
        .write_all(input_data.as_bytes())?;
    println!("wrote to stdin");
    println!("returning from run_d2");
    // Wait for the binary to finish processing and collect its output
    let output = child.wait_with_output()?;
    println!("output: {:?}", output);

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

fn run_d2_windows(input_data: &String) -> Option<Result<String, Box<dyn Error>>> {
    //Run the executable
    let input_filename = "input.d2";
    let output_filename = "output.svg";
    //Write input data to input.d2
    std::fs::write(input_filename, input_data.clone()).expect("Unable to write file");
    let status = Command::new("d2_binaries/d2.exe")
        .arg(input_filename)
        .arg(output_filename)
        .status()
        .expect("failed to execute d2.exe");

    if status.success() {
        println!("d2.exe completed successfully");
        //Read output file
        let output_data = std::fs::read_to_string(output_filename).expect("Unable to read file");
        // println!("output_data: {:?}", output_data);
        return Some(Ok(output_data));
    } else {
        println!("d2.exe exited with status code {:?}", status.code());
        //return all the output in Err
        return Some(Err(format!(
            "d2.exe exited with status code {:?}",
            status.code()
        )
        .into()));
    }
}
