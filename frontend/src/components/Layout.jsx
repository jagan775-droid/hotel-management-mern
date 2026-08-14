import Sidebar from "./Sidebar";

const Layout = ({ children }) => (
  <div className="flex min-h-screen bg-paper">
    <Sidebar />
    <main className="flex-1 px-8 py-8 max-w-6xl">{children}</main>
  </div>
);

export default Layout;
