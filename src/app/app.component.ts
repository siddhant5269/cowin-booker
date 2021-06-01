import { Component, OnInit } from "@angular/core";
import { CowinService } from "./cowin.service";
import sha256 from "crypto-js/sha256";
import { forkJoin } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  title = "cowin-booker";
  districtId: number = 294;
  stateId: number = 16;
  dateToSearch: Date = new Date();
  districts: { district_id: number; district_name: string }[];
  states: { state_id: number; state_name: string }[];
  sessions: any[];
  secret =
    "U2FsdGVkX1+cT2Qfq1kv/ykrZl11X1e/O5DIQIJQmIEW++zs3Jq8Lb0yNW1k+CfhWylDQloO/2dRrIM9B7GeSA==";

  mobile = 8763152962;
  benefeciaries = ["", ""];
  bearerToken = "";
  otp = "";
  txnId: "";
  response = {};
  interval: any;
  constructor(readonly cowinService: CowinService) {}

  ngOnInit() {
    this.cowinService.GetStates().subscribe((res: any) => {
      this.states = res.states;
    });
    this.handleStateSelection(this.stateId);

    this.interval = setInterval(() => this.searchHandler(), 9000);
  }

  searchHandler() {
    forkJoin(
      this.cowinService.GetAvailibilty(
        this.districtId,
        new Date(this.dateToSearch)
      ),
      this.cowinService.GetAvailibilty(
        this.districtId,
        this.addDays(new Date(this.dateToSearch), 1)
      ),
      this.cowinService.GetAvailibilty(
        this.districtId,
        this.addDays(new Date(this.dateToSearch), 2)
      ),
      this.cowinService.GetAvailibilty(
        this.districtId,
        this.addDays(new Date(this.dateToSearch), 3)
      )
    )
      .pipe(
        map((results: any) => {
          return results
            .flatMap((res) => res.sessions)
            .filter(
              (session) =>
                session.min_age_limit === 18 &&
                session.available_capacity_dose1 > 0
            );
        })
      )
      .subscribe((sessions) => {
        this.sessions = sessions;
      });
  }

  addDays(originalDate: Date, noOfDays: number) {
    var date = new Date(originalDate.valueOf());
    date.setDate(date.getDate() + noOfDays);
    return date;
  }

  handleStateSelection(stateId: number) {
    this.cowinService.GetDistricts(stateId).subscribe((res: any) => {
      this.districts = res.districts as any;
    });
  }

  handleOtpSubmit() {
    this.cowinService
      .ConfirmOTP({ otp: this.generateSHA256(this.otp), txnId: this.txnId })
      .subscribe((res: any) => {
        this.response = res;
        this.bearerToken = res.token;
        this.cowinService
          .getRecaptcha(this.bearerToken)
          .subscribe((captchaHtml) => {
            console.log(captchaHtml);
          });
      });
  }

  handleCaptchaSubmit(slot: string, session_id: any, center_id: any) {
    const appointmentPayload = {
      dose: 1,
      session_id: session_id,
      slot: slot,
      beneficiaries: this.benefeciaries,
      center_id: center_id,
      captcha: "Dbr6m",
    };
    this.cowinService
      .ScheduleAppointment(appointmentPayload, this.bearerToken)
      .subscribe((res) => {
        this.response = res;
      });
  }

  handleOtpGen() {
    this.cowinService
      .GenerateOTP({ secret: this.secret, mobile: this.mobile })
      .subscribe((res: any) => {
        this.response = res;
        this.txnId = res.txnId;
      });
  }

  generateSHA256(input: string) {
    return sha256(input).toString();
  }

  handleStopQuery() {
    clearInterval(this.interval);
    this.interval = undefined;
  }
  handleStartQuery() {
    if (!this.interval) {
      this.interval = setInterval(() => this.searchHandler(), 9000);
    }
  }
}
