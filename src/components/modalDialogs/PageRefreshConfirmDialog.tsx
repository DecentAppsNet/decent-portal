import ModalDialog from "./ModalDialog";
import DialogButton from "./DialogButton";
import DialogFooter from "./DialogFooter";

interface IProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function PageRefreshConfirmDialog(props: IProps) {
  const { isOpen, onCancel, onConfirm } = props;
  
  return (
    <ModalDialog isOpen={isOpen} title="LLM Changed" onCancel={onCancel}>
      <p>
        Would you like to reload the app to use the new LLM that you chose?
      </p>
      <DialogFooter>
        <DialogButton text="Not Now" onClick={onCancel} />
        <DialogButton text="Refresh Page" onClick={onConfirm} isPrimary />
      </DialogFooter>
    </ModalDialog>
  );
}

export default PageRefreshConfirmDialog;