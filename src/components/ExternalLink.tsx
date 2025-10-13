import Link from "@docusaurus/Link"
import { ExternalLink as ExternalLinkIcon } from "lucide-react"

export default function ExternalLink({ to, title }) {
    return (
        <Link to={to}>
            <div className="flex font-bold gap-1">
                <ExternalLinkIcon />
                <div>{title}</div>
            </div>
        </Link>
    )
}
