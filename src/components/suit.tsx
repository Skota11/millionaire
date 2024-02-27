//icons
import { BsFillSuitSpadeFill } from "react-icons/bs";
import { BsFillSuitHeartFill } from "react-icons/bs";
import { BsSuitClubFill } from "react-icons/bs";
import { BsFillSuitDiamondFill } from "react-icons/bs";
import { GiCardJoker } from "react-icons/gi";

export default function Main(props: any) {
    switch (props.suit) {
        case 0:
            return <GiCardJoker />
        case 1:
            return <BsSuitClubFill />
        case 2:
            return <BsFillSuitDiamondFill />
        case 3:
            return <BsFillSuitHeartFill />
        case 4:
            return <BsFillSuitSpadeFill />
        default:
            break;
    }
}