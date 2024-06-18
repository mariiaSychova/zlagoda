import Header from "@/components/common/Header/Header";

export default function NotFoundPage() {
  return (
    <div className="page-container">
      <Header />
      <h2 style={{ textAlign: "center", marginTop: "200px" }}>
        Error 404 | Page not found
      </h2>
    </div>
  );
}
