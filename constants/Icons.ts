/**
 * August.ai Icon System
 * Centralized location for all app icons using phosphor-react-native
 */

import {
  ChatCircle,
  FileText,
  Camera,
  Image,
  PaperPlaneRight,
  Plus,
  X,
  Repeat, // Replaced RotateCcw with Repeat
  Gear,
  User,
  Bell,
  Question,
  Info,
  SignOut,
  CaretLeft,
  CaretRight,
  Check,
  Warning,
  ArrowLeft,
  Trash,
  DotsThreeVertical,
  MagnifyingGlass,
  Calendar,
  Clock,
  Pill,
  FirstAid,
  Syringe,
  Clipboard,
  Copy,
  Share,
  ThumbsUp,
  ThumbsDown,
  ArrowDown,
  List,
} from 'phosphor-react-native';

const Icons = {
  // Navigation
  Chat: ChatCircle,
  Prescription: FileText,
  Settings: Gear,
  Back: ArrowLeft,
  
  // Actions
  Camera: Camera,
  Gallery: Image,
  Send: PaperPlaneRight,
  Add: Plus,
  Close: X,
  Retry: Repeat, // Changed from RotateCcw to Repeat
  Delete: Trash,
  Search: MagnifyingGlass,
  More: DotsThreeVertical,
  Menu: List,
  Check: Check,
  
  // User
  User: User,
  Notifications: Bell,
  Help: Question,
  Info: Info,
  Logout: SignOut,
  
  // Navigation
  Previous: CaretLeft,
  Next: CaretRight,
  
  // Status
  Warning: Warning,
  
  // Medical
  Calendar: Calendar,
  Time: Clock,
  Medication: Pill,
  MedicalKit: FirstAid,
  Injection: Syringe,
  MedicalRecord: Clipboard,
  
  // Message Actions
  Copy: Copy,
  Share: Share,
  ThumbsUp: ThumbsUp,
  ThumbsDown: ThumbsDown,
  ArrowDown: ArrowDown,
};

export default Icons;