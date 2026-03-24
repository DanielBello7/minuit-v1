import {
  KeyboardAvoidingView as KAView,
  Keyboard,
  KeyboardAvoidingViewProps,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
export const KeyboardAvoidingView = (props: KeyboardAvoidingViewProps) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KAView
        {...props}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      />
    </TouchableWithoutFeedback>
  );
};
