import { CalendarIcon, ChartBarIcon, FolderIcon, HomeIcon, InboxIcon, UsersIcon } from '@heroicons/react/24/outline'

const navigation = [
  { name: 'File 1', href: '#', icon: HomeIcon, current: true },
  { name: 'File 2', href: '#', icon: HomeIcon, current: false },
]

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Folder() {
  return (
    <nav className="space-y-1" aria-label="Sidebar">
      {navigation.map((item) => (
        <a
          key={item.name}
          href={item.href}
          className={classNames(
            item.current ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            'group flex items-center rounded-md px-3 py-2 text-sm font-medium'
          )}
          aria-current={item.current ? 'page' : undefined}
        >
          <item.icon
            className={classNames(
              item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
              '-ml-1 mr-3 h-6 w-6 flex-shrink-0'
            )}
            aria-hidden="true"
          />
          <span className="truncate">{item.name}</span>
        </a>
      ))}
    </nav>
  )
}
