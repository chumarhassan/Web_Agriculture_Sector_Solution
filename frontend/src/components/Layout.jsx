import TopBar from './TopBar';
import LeftNav from './LeftNav';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="flex">
        <LeftNav />
        <main className="flex-1 p-6 lg:ml-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
