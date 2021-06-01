import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class CowinService {

  readonly cowinApiBaseUrl = "https://cdn-api.co-vin.in/api/v2";

  constructor(readonly httpclient: HttpClient) {}

  public GetAvailibilty(districtId: number, dateFor: Date) {
    return this.httpclient.get(
      `${
        this.cowinApiBaseUrl
      }/appointment/sessions/public/findByDistrict?district_id=${districtId}&date=${dateFor.getDate()}-${
        dateFor.getMonth() + 1
      }-${dateFor.getFullYear()}`
    );
  }

  public GetStates() {
    return this.httpclient.get(`${this.cowinApiBaseUrl}/admin/location/states`);
  }

  public GetDistricts(stateId: number) {
    return this.httpclient.get(
      `${this.cowinApiBaseUrl}/admin/location/districts/${stateId}`
    );
  }
  public GenerateOTP(otpPayload: { secret: string; mobile: number }) {
    return this.httpclient.post(
      `${this.cowinApiBaseUrl}/auth/generateMobileOTP`,
      otpPayload
    );
  }

  public ConfirmOTP(otpPayload: { otp: string; txnId: string }) {
    return this.httpclient.post(
      `${this.cowinApiBaseUrl}/auth/validateMobileOtp`,
      otpPayload
    );
  }

  public ScheduleAppointment(appointmentPayload: any, token: string) {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    });
    return this.httpclient.post(
      `${this.cowinApiBaseUrl}/appointment/schedule`,
      appointmentPayload,
      {headers: headers}
    );
  }

  getRecaptcha(token: string) {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    });
    return this.httpclient.post(
      `${this.cowinApiBaseUrl}/auth/reRecaptcha`,
      {},
      {headers: headers}
    );
  }
}
