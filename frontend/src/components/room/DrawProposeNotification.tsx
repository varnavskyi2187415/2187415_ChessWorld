import {ToastContentProps} from "react-toastify";

interface DrawProposeNotificationProps extends ToastContentProps {
  onAccept: (roomId: string) => void;
  roomId: string;
}

function DrawProposeNotification({ closeToast, onAccept, roomId }: DrawProposeNotificationProps) {
  return (
    <div>
      You received a new message
      <button onClick={() => onAccept(roomId)}>Reply</button>
      <button onClick={() => closeToast()}>Ignore</button>
    </div>
  )
}