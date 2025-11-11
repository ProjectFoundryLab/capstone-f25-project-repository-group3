import Card from "../components/Card"

export default function DashboardContent() {
    return (
        <>
            <div className="card-container">
                <Card title="Total Assets" val="1,428" />
                <Card title="In Use" val="1,102" />
                <Card title="In Stock" val="250" />
                <Card title="Retired" val="76" />
            </div>
        </>
    )
}