import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  //  Login
  login(payload: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/login`, payload);
  }

  // Send OTP
  sendOtp(payload: { email: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/send-otp`, payload);
  }

    // Verify OTP & Register
    verifyAndRegister(payload: { 
      email: string; 
      otp: string; 
      password: string; 
      confirmPassword: string; 
    }): Observable<any> {
      return this.http.post(`${this.apiUrl}/Auth/verify-register`, payload);
    }

    
  createProduct(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/Product`, formData);
  }
  
   //  Get All Products
   getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Product`);
  }
  

  //  Get Product by ID
  getProductById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Product/${id}`);
  }

    //  Update Product (with image upload)
  updateProduct(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/Product/${id}`, formData);
  }

  //  Delete Product
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Product/${id}`);
  }
   // Add to Cart
   addToCart(payload: { productId: number; quantity: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/Cart/add`, payload);
  }

  // Update Cart Item
  updateCartItem(payload: { cartItemId: number; quantity: number }): Observable<any> {
    return this.http.put(`${this.apiUrl}/Cart/update`, payload);
  }

  // Remove Cart Item
  removeCartItem(cartItemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Cart/remove/${cartItemId}`);
  }

  // Get Cart
  getCart(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Cart`);
  }
  
   // Profile APIs
   getMyProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Profile/me`);
  }

  // Complete or update profile
  completeProfile(payload: {
    fullName: string;
    phoneNumber: string;
    address: string;
    stateId: number;
    districtId: number;
    pincode: string;
    postOfficeId: number;
    dateOfBirth?: string;
    gender: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/Profile/complete`, payload);
  }

  // Get Pincode details (State, District, Post Offices)
  getPincodeDetails(pincodeValue: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/Profile/pincode/${pincodeValue}`);
  }
    //  Complete Purchase
    completePurchase(): Observable<any> {
      return this.http.post(`${this.apiUrl}/Purchase/complete`, {}); 
      // Backend uses logged-in userId from JWT, so no payload required
    }
     //  Get All Purchases (Admin)
  getAllPurchases(params: { pageNumber: number; pageSize: number; sortBy?: string; sortOrder?: string }): Observable<any> {
    return this.http.get(`${this.apiUrl}/Purchase/all`, { params: params as any });
  }

  //  Get Purchase by Id
  getPurchaseById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/Purchase/${id}`);
  }

  //  Get My Purchases (User)
  getMyPurchases(params: { pageNumber: number; pageSize: number; sortBy?: string; sortOrder?: string }): Observable<any> {
    return this.http.get(`${this.apiUrl}/Purchase/my`, { params: params as any });
  }
}