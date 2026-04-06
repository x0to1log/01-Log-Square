export default function LobbyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        {children}
      </div>
    </div>
  )
}
