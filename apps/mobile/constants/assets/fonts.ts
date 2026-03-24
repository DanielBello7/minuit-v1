// FONTS
// fonts: DM Sans
import DMSansBlack from "@/assets/fonts/dm-sans/static/DMSans-Black.ttf";
import DMSansExtraBold from "@/assets/fonts/dm-sans/static/DMSans-ExtraBold.ttf";
import DMSansSemiBold from "@/assets/fonts/dm-sans/static/DMSans-SemiBold.ttf";
import DMSansBold from "@/assets/fonts/dm-sans/static/DMSans-Bold.ttf";
import DMSansRegular from "@/assets/fonts/dm-sans/static/DMSans-Regular.ttf";
import DMSansMedium from "@/assets/fonts/dm-sans/static/DMSans-Medium.ttf";
import DMSansExtraLight from "@/assets/fonts/dm-sans/static/DMSans-ExtraLight.ttf";
import DMSansLight from "@/assets/fonts/dm-sans/static/DMSans-Light.ttf";
import DMSansThin from "@/assets/fonts/dm-sans/static/DMSans-Thin.ttf";
import DMSansItalic from "@/assets/fonts/dm-sans/static/DMSans-Italic.ttf";

// fonts: Inter
import InterBlack from "@/assets/fonts/Inter/static/Inter_18pt-Black.ttf";
import InterExtraBold from "@/assets/fonts/Inter/static/Inter_18pt-ExtraBold.ttf";
import InterSemiBold from "@/assets/fonts/Inter/static/Inter_18pt-SemiBold.ttf";
import InterBold from "@/assets/fonts/Inter/static/Inter_18pt-Bold.ttf";
import InterRegular from "@/assets/fonts/Inter/static/Inter_18pt-Regular.ttf";
import InterMedium from "@/assets/fonts/Inter/static/Inter_18pt-Medium.ttf";
import InterExtraLight from "@/assets/fonts/Inter/static/Inter_18pt-ExtraLight.ttf";
import InterLight from "@/assets/fonts/Inter/static/Inter_18pt-Light.ttf";
import InterThin from "@/assets/fonts/Inter/static/Inter_18pt-Thin.ttf";
import InterItalic from "@/assets/fonts/Inter/static/Inter_18pt-Italic.ttf";

// fonts:
import PlusJakartaSansExtraBold from "@/assets/fonts/plus-jakarta-sans/static/PlusJakartaSans-ExtraBold.ttf";
import PlusJakartaSansSemiBold from "@/assets/fonts/plus-jakarta-sans/static/PlusJakartaSans-SemiBold.ttf";
import PlusJakartaSansBold from "@/assets/fonts/plus-jakarta-sans/static/PlusJakartaSans-Bold.ttf";
import PlusJakartaSansRegular from "@/assets/fonts/plus-jakarta-sans/static/PlusJakartaSans-Regular.ttf";
import PlusJakartaSansMedium from "@/assets/fonts/plus-jakarta-sans/static/PlusJakartaSans-Medium.ttf";
import PlusJakartaSansExtraLight from "@/assets/fonts/plus-jakarta-sans/static/PlusJakartaSans-ExtraLight.ttf";
import PlusJakartaSansLight from "@/assets/fonts/plus-jakarta-sans/static/PlusJakartaSans-Light.ttf";
import PlusJakartaSansItalic from "@/assets/fonts/plus-jakarta-sans/static/PlusJakartaSans-Italic.ttf";

const FONTS = {
  DMSans: {
    Black: DMSansBlack,
    ExtraBold: DMSansExtraBold,
    SemiBold: DMSansSemiBold,
    Bold: DMSansBold,
    Regular: DMSansRegular,
    Medium: DMSansMedium,
    ExtraLight: DMSansExtraLight,
    Light: DMSansLight,
    Thin: DMSansThin,
    Italic: DMSansItalic,
  },
  Inter: {
    Black: InterBlack,
    ExtraBold: InterExtraBold,
    SemiBold: InterSemiBold,
    Bold: InterBold,
    Regular: InterRegular,
    Medium: InterMedium,
    ExtraLight: InterExtraLight,
    Light: InterLight,
    Thin: InterThin,
    Italic: InterItalic,
  },
  PlusJakartaSans: {
    Black: undefined,
    ExtraBold: PlusJakartaSansExtraBold,
    SemiBold: PlusJakartaSansSemiBold,
    Bold: PlusJakartaSansBold,
    Regular: PlusJakartaSansRegular,
    Medium: PlusJakartaSansMedium,
    ExtraLight: PlusJakartaSansExtraLight,
    Light: PlusJakartaSansLight,
    Thin: undefined,
    Italic: PlusJakartaSansItalic,
  },
};

const FONTS_OBJ = {
  // DMSansBlack
  DMSansBlack: FONTS.DMSans.Black,
  DMSansExtraBold: FONTS.DMSans.ExtraBold,
  DMSansSemiBold: FONTS.DMSans.SemiBold,
  DMSansBold: FONTS.DMSans.Bold,
  DMSansRegular: FONTS.DMSans.Regular,
  DMSansMedium: FONTS.DMSans.Medium,
  DMSansExtraLight: FONTS.DMSans.ExtraLight,
  DMSansLight: FONTS.DMSans.Light,
  DMSansThin: FONTS.DMSans.Thin,
  DMSansItalic: FONTS.DMSans.Italic,
  //
  // Inter
  InterBlack: FONTS.Inter.Black,
  InterExtraBold: FONTS.Inter.ExtraBold,
  InterSemiBold: FONTS.Inter.SemiBold,
  InterBold: FONTS.Inter.Bold,
  InterRegular: FONTS.Inter.Regular,
  InterMedium: FONTS.Inter.Medium,
  InterExtraLight: FONTS.Inter.ExtraLight,
  InterLight: FONTS.Inter.Light,
  InterThin: FONTS.Inter.Thin,
  InterItalic: FONTS.Inter.Italic,
  //
  // PlusJakartaSans
  PlusJakartaSansExtraBold: FONTS.PlusJakartaSans.ExtraBold,
  PlusJakartaSansSemiBold: FONTS.PlusJakartaSans.SemiBold,
  PlusJakartaSansBold: FONTS.PlusJakartaSans.Bold,
  PlusJakartaSansRegular: FONTS.PlusJakartaSans.Regular,
  PlusJakartaSansMedium: FONTS.PlusJakartaSans.Medium,
  PlusJakartaSansExtraLight: FONTS.PlusJakartaSans.ExtraLight,
  PlusJakartaSansLight: FONTS.PlusJakartaSans.Light,
  PlusJakartaSansItalic: FONTS.PlusJakartaSans.Italic,
};

export { FONTS, FONTS_OBJ };
