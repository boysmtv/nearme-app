//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'otp_request.g.dart';

/// OtpRequest
///
/// Properties:
/// * [email] 
/// * [code] 
/// * [purpose] 
@BuiltValue()
abstract class OtpRequest implements Built<OtpRequest, OtpRequestBuilder> {
  @BuiltValueField(wireName: r'email')
  String get email;

  @BuiltValueField(wireName: r'code')
  String? get code;

  @BuiltValueField(wireName: r'purpose')
  OtpRequestPurposeEnum get purpose;
  // enum purposeEnum {  REGISTER,  LOGIN,  RESET_PASSWORD,  VERIFY_EMAIL,  VERIFY_PHONE,  };

  OtpRequest._();

  factory OtpRequest([void updates(OtpRequestBuilder b)]) = _$OtpRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(OtpRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<OtpRequest> get serializer => _$OtpRequestSerializer();
}

class _$OtpRequestSerializer implements PrimitiveSerializer<OtpRequest> {
  @override
  final Iterable<Type> types = const [OtpRequest, _$OtpRequest];

  @override
  final String wireName = r'OtpRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    OtpRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'email';
    yield serializers.serialize(
      object.email,
      specifiedType: const FullType(String),
    );
    if (object.code != null) {
      yield r'code';
      yield serializers.serialize(
        object.code,
        specifiedType: const FullType(String),
      );
    }
    yield r'purpose';
    yield serializers.serialize(
      object.purpose,
      specifiedType: const FullType(OtpRequestPurposeEnum),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    OtpRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required OtpRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'email':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.email = valueDes;
          break;
        case r'code':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.code = valueDes;
          break;
        case r'purpose':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(OtpRequestPurposeEnum),
          ) as OtpRequestPurposeEnum;
          result.purpose = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  OtpRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = OtpRequestBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}

class OtpRequestPurposeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'REGISTER')
  static const OtpRequestPurposeEnum REGISTER = _$otpRequestPurposeEnum_REGISTER;
  @BuiltValueEnumConst(wireName: r'LOGIN')
  static const OtpRequestPurposeEnum LOGIN = _$otpRequestPurposeEnum_LOGIN;
  @BuiltValueEnumConst(wireName: r'RESET_PASSWORD')
  static const OtpRequestPurposeEnum RESET_PASSWORD = _$otpRequestPurposeEnum_RESET_PASSWORD;
  @BuiltValueEnumConst(wireName: r'VERIFY_EMAIL')
  static const OtpRequestPurposeEnum VERIFY_EMAIL = _$otpRequestPurposeEnum_VERIFY_EMAIL;
  @BuiltValueEnumConst(wireName: r'VERIFY_PHONE')
  static const OtpRequestPurposeEnum VERIFY_PHONE = _$otpRequestPurposeEnum_VERIFY_PHONE;

  static Serializer<OtpRequestPurposeEnum> get serializer => _$otpRequestPurposeEnumSerializer;

  const OtpRequestPurposeEnum._(String name): super(name);

  static BuiltSet<OtpRequestPurposeEnum> get values => _$otpRequestPurposeEnumValues;
  static OtpRequestPurposeEnum valueOf(String name) => _$otpRequestPurposeEnumValueOf(name);
}

