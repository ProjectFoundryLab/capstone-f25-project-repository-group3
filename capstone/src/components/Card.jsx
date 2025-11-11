export default function Card(props) {
    return (
        <div className="bg-white p-10">
            <p>{props.title}</p>
            <p>{props.val}</p>
        </div>
    )
}