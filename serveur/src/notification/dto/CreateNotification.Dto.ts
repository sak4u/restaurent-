export class  CreateNotificationDto {
  userId?: number;
  cuisinierId?: number;
  adminId?: number;
  message: string;
  type?: string;
}