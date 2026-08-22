package id.dekat.sharedkernel;

import lombok.Getter;

@Getter
public enum Currency {
    IDR("IDR", "Indonesian Rupiah"),
    USD("USD", "United States Dollar");

    private final String code;
    private final String displayName;

    Currency(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }
}
