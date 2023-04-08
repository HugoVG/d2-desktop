import { CalendarIcon, ChartBarIcon, FolderIcon, HomeIcon, InboxIcon, UsersIcon, TrashIcon } from '@heroicons/react/24/outline'
import { invoke } from '@tauri-apps/api/tauri';
import { useState } from "react";



function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}


export default function Folder(props: any) {
  const { handleEditorChange, handleFileChange, setIsNewFile, currentFileName } = props;
  const [navigationFiles, setNavigationFiles] = useState<NavigationItem[]>([]);
  async function refresh() {
    //call rust function to get list of files
    const result = await invoke<string[]>('get_input_files');
    // map the result to the navigation object but removes file extension
    let navigation = result.map((item) => {
      return {
        name: item!.split('\\')!.pop()!.split('.').slice(0, -1).join('.'),
        href: item,
        icon: HomeIcon,
        current: item === currentFileName
      }
    });
    setNavigationFiles(navigation);
  }
  async function openFile(file: string) { 
    console.log(file);
    //call rust function to get list of files
    const result = await invoke<string>('get_input_file_contents', { fileName: file });
    console.log(result);
    handleEditorChange(result);    
    // set the current file
    handleFileChange(file);
    refresh();
  }
  async function deleteFile(file: string) {
    console.log(file);
    //call rust function to get list of files
    const result = await invoke<string>('remove_input_file', { fileName: file });
    console.log(result);
    refresh();
  }
  // call refresh only once when the component is mounted
  refresh();

  return (
    // Button that refreshes the navigation list from rust
    <nav className="space-y-1" aria-label="Sidebar">
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={refresh}>Refresh</button>
      {navigationFiles.map((item) => (
        <a
          key={item.name}
          href="#" //so that it doesn't reload the page
          aria-current={item.current ? 'page' : undefined}
          className={classNames(
            item.current ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            'group flex items-center rounded-md px-2 py-2 text-sm font-medium'
          )}
        >
          <div className={classNames(
            item.current ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            'group flex grow items-center rounded-md py-2 text-sm font-medium'
          )}
            onClick={() => openFile(item.href)}
          >
            <item.icon
              className={classNames(
                item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                '-ml-1 mr-3 h-6 w-6 flex-shrink-0'
              )}
              
              aria-hidden="true"
            />
            <span className="truncate overflow-hidden">{item.name}</span>

          </div>
          <a className="hidden group-hover:block grow-0 h-4 w-4 justify-self-end " onClick={() => deleteFile(item.href)}>
            <TrashIcon className="hidden group-hover:block text-red-500" />
          </a>
        </a>
      ))}
      <a
        href="#"
        className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      >
        <span className="truncate" onClick={() => setIsNewFile()}>Add new file</span>
      </a>

    </nav>
  )
}
//{ name: 'File 1', href: '#', icon: HomeIcon, current: true },
class NavigationItem{
  name: string;
  href: string;
  icon: any; 
  current: boolean;
  constructor(name: string, href: string, icon: any, current: boolean){
    this.name = name;
    this.href = href;
    this.icon = icon;
    this.current = current;
  }
}