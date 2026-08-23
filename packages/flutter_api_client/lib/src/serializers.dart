//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_import

import 'package:one_of_serializer/any_of_serializer.dart';
import 'package:one_of_serializer/one_of_serializer.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/json_object.dart';
import 'package:built_value/serializer.dart';
import 'package:built_value/standard_json_plugin.dart';
import 'package:built_value/iso_8601_date_time_serializer.dart';
import 'package:dekat_api_client/src/date_serializer.dart';
import 'package:dekat_api_client/src/model/date.dart';

import 'package:dekat_api_client/src/model/booking.dart';
import 'package:dekat_api_client/src/model/booking_hold.dart';
import 'package:dekat_api_client/src/model/create_booking_request.dart';
import 'package:dekat_api_client/src/model/create_hold_request.dart';
import 'package:dekat_api_client/src/model/create_tenant_request.dart';
import 'package:dekat_api_client/src/model/error_response.dart';
import 'package:dekat_api_client/src/model/location.dart';
import 'package:dekat_api_client/src/model/location_request.dart';
import 'package:dekat_api_client/src/model/login_request.dart';
import 'package:dekat_api_client/src/model/otp_request.dart';
import 'package:dekat_api_client/src/model/paginated_response.dart';
import 'package:dekat_api_client/src/model/register_request.dart';
import 'package:dekat_api_client/src/model/reschedule_request.dart';
import 'package:dekat_api_client/src/model/service.dart';
import 'package:dekat_api_client/src/model/staff.dart';
import 'package:dekat_api_client/src/model/tenant.dart';
import 'package:dekat_api_client/src/model/token_response.dart';

part 'serializers.g.dart';

@SerializersFor([
  Booking,
  BookingHold,
  CreateBookingRequest,
  CreateHoldRequest,
  CreateTenantRequest,
  ErrorResponse,
  Location,
  LocationRequest,
  LoginRequest,
  OtpRequest,
  PaginatedResponse,
  RegisterRequest,
  RescheduleRequest,
  Service,
  Staff,
  Tenant,
  TokenResponse,
])
Serializers serializers = (_$serializers.toBuilder()
      ..addBuilderFactory(
        const FullType(BuiltList, [FullType(Tenant)]),
        () => ListBuilder<Tenant>(),
      )
      ..addBuilderFactory(
        const FullType(BuiltList, [FullType(Location)]),
        () => ListBuilder<Location>(),
      )
      ..addBuilderFactory(
        const FullType(BuiltList, [FullType(JsonObject)]),
        () => ListBuilder<JsonObject>(),
      )
      ..add(const OneOfSerializer())
      ..add(const AnyOfSerializer())
      ..add(const DateSerializer())
      ..add(Iso8601DateTimeSerializer())
    ).build();

Serializers standardSerializers =
    (serializers.toBuilder()..addPlugin(StandardJsonPlugin())).build();
