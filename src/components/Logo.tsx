export default function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <svg
        className="w-8 h-8 text-green-600"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16 15.5C16 16.33 15.33 17 14.5 17H9.5C8.67 17 8 16.33 8 15.5V15H16V15.5ZM16 14H8L7 8H17L16 14Z"
          fill="currentColor"
        />
      </svg>
      <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
        Recepta
      </span>
    </div>
  );
} 