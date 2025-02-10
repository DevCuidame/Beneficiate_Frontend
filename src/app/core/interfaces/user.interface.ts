export interface Image {
  id: number;
  public_name: string;
  private_name: string;
  image_path: string;
  uploaded_at: string;
}

export interface UserImage extends Image {
  user_id: string;
}


export interface BeneficiaryImage extends Image {
  beneficiary_id: string;
}