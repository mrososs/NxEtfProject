import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MissionVision } from '../model/mission-vision.model';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MissionVisionService {

private http = inject(HttpClient);
private translate = inject(TranslateService);


getMissionVision(): Observable<MissionVision> {
  const lang = "ar";
  return this.http.get<MissionVision>(`/api/Content/MissionAndVision/${lang}`)
}


}
